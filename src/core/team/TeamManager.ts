import * as vscode from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';
import { TemplateConfig } from '../../types';
import { Logger } from '../../utils/logger';

export interface Team {
    id: string;
    name: string;
    description: string;
    ownerId: string;
    members: TeamMember[];
    templates: OrganizationTemplate[];
    settings: TeamSettings;
    createdAt: Date;
    updatedAt: Date;
}

export interface TeamMember {
    id: string;
    email: string;
    name: string;
    role: TeamRole;
    joinedAt: Date;
    permissions: Permission[];
}

export interface OrganizationTemplate extends TemplateConfig {
    organizationId: string;
    approvalStatus: ApprovalStatus;
    usageMetrics: UsageMetrics;
    complianceTags: ComplianceTag[];
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    version: string;
}

export interface TeamSettings {
    allowTemplateSharing: boolean;
    requireApproval: boolean;
    maxTemplatesPerMember: number;
    allowedLanguages: string[];
    allowedFrameworks: string[];
    complianceRequirements: ComplianceRequirement[];
}

export interface UsageMetrics {
    totalUsage: number;
    successfulUsage: number;
    averageRating: number;
    lastUsed: Date;
    popularFeatures: string[];
}

export interface ComplianceTag {
    name: string;
    value: string;
    required: boolean;
}

export interface ComplianceRequirement {
    type: 'security' | 'privacy' | 'licensing' | 'custom';
    name: string;
    description: string;
    required: boolean;
}

export enum TeamRole {
    OWNER = 'owner',
    ADMIN = 'admin',
    MEMBER = 'member',
    VIEWER = 'viewer'
}

export enum ApprovalStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    ARCHIVED = 'archived'
}

export interface Permission {
    resource: string;
    actions: string[];
}

export class TeamManager {
    private static instance: TeamManager;
    private teams: Map<string, Team> = new Map();
    private userTeams: Map<string, string[]> = new Map(); // userId -> teamIds
    private logger = Logger.getInstance();
    private storagePath: string;

    private constructor() {
        this.storagePath = path.join(vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '', '.edino', 'teams');
    }

    public static getInstance(): TeamManager {
        if (!TeamManager.instance) {
            TeamManager.instance = new TeamManager();
        }
        return TeamManager.instance;
    }

    public async initialize(): Promise<void> {
        this.logger.info('Initializing Team Manager');
        await this.loadTeams();
    }

    public async createTeam(teamConfig: {
        name: string;
        description: string;
        ownerId: string;
        settings?: Partial<TeamSettings>;
    }): Promise<Team> {
        this.logger.info(`Creating team: ${teamConfig.name}`);

        const team: Team = {
            id: this.generateTeamId(),
            name: teamConfig.name,
            description: teamConfig.description,
            ownerId: teamConfig.ownerId,
            members: [{
                id: teamConfig.ownerId,
                email: 'owner@example.com', // This would come from user profile
                name: 'Team Owner',
                role: TeamRole.OWNER,
                joinedAt: new Date(),
                permissions: this.getDefaultPermissions(TeamRole.OWNER)
            }],
            templates: [],
            settings: {
                allowTemplateSharing: true,
                requireApproval: false,
                maxTemplatesPerMember: 10,
                allowedLanguages: [],
                allowedFrameworks: [],
                complianceRequirements: [],
                ...teamConfig.settings
            },
            createdAt: new Date(),
            updatedAt: new Date()
        };

        this.teams.set(team.id, team);
        this.addUserToTeam(teamConfig.ownerId, team.id);
        await this.saveTeams();

        this.logger.info(`Team created successfully: ${team.id}`);
        return team;
    }

    public async inviteMember(teamId: string, email: string, role: TeamRole): Promise<void> {
        this.logger.info(`Inviting member to team ${teamId}: ${email}`);

        const team = this.teams.get(teamId);
        if (!team) {
            throw new Error(`Team not found: ${teamId}`);
        }

        // Check if member already exists
        const existingMember = team.members.find(m => m.email === email);
        if (existingMember) {
            throw new Error(`Member already exists: ${email}`);
        }

        const member: TeamMember = {
            id: this.generateUserId(),
            email,
            name: email.split('@')[0], // Simple name extraction
            role,
            joinedAt: new Date(),
            permissions: this.getDefaultPermissions(role)
        };

        team.members.push(member);
        team.updatedAt = new Date();

        await this.saveTeams();
        this.logger.info(`Member invited successfully: ${email}`);
    }

    public async shareTemplate(teamId: string, template: TemplateConfig): Promise<OrganizationTemplate> {
        this.logger.info(`Sharing template with team ${teamId}: ${template.name}`);

        const team = this.teams.get(teamId);
        if (!team) {
            throw new Error(`Team not found: ${teamId}`);
        }

        const orgTemplate: OrganizationTemplate = {
            ...template,
            organizationId: teamId,
            approvalStatus: team.settings.requireApproval ? ApprovalStatus.PENDING : ApprovalStatus.APPROVED,
            usageMetrics: {
                totalUsage: 0,
                successfulUsage: 0,
                averageRating: 0,
                lastUsed: new Date(),
                popularFeatures: []
            },
            complianceTags: [],
            createdBy: 'current-user', // This would come from auth context
            createdAt: new Date(),
            updatedAt: new Date(),
            version: '1.0.0'
        };

        team.templates.push(orgTemplate);
        team.updatedAt = new Date();

        await this.saveTeams();
        this.logger.info(`Template shared successfully: ${template.name}`);
        return orgTemplate;
    }

    public async getTeamTemplates(teamId: string): Promise<OrganizationTemplate[]> {
        const team = this.teams.get(teamId);
        if (!team) {
            throw new Error(`Team not found: ${teamId}`);
        }

        return team.templates.filter(t => t.approvalStatus === ApprovalStatus.APPROVED);
    }

    public async getUserTeams(userId: string): Promise<Team[]> {
        const userTeamIds = this.userTeams.get(userId) || [];
        return userTeamIds.map(id => this.teams.get(id)).filter(Boolean) as Team[];
    }

    public async updateTeamSettings(teamId: string, settings: Partial<TeamSettings>): Promise<void> {
        this.logger.info(`Updating team settings: ${teamId}`);

        const team = this.teams.get(teamId);
        if (!team) {
            throw new Error(`Team not found: ${teamId}`);
        }

        team.settings = { ...team.settings, ...settings };
        team.updatedAt = new Date();

        await this.saveTeams();
        this.logger.info(`Team settings updated successfully`);
    }

    public async approveTemplate(teamId: string, templateId: string, approved: boolean): Promise<void> {
        this.logger.info(`Approving template: ${templateId}, approved: ${approved}`);

        const team = this.teams.get(teamId);
        if (!team) {
            throw new Error(`Team not found: ${teamId}`);
        }

        const template = team.templates.find(t => t.name === templateId);
        if (!template) {
            throw new Error(`Template not found: ${templateId}`);
        }

        template.approvalStatus = approved ? ApprovalStatus.APPROVED : ApprovalStatus.REJECTED;
        template.updatedAt = new Date();

        await this.saveTeams();
        this.logger.info(`Template approval status updated: ${template.approvalStatus}`);
    }

    public async trackTemplateUsage(templateId: string, success: boolean, rating?: number): Promise<void> {
        this.logger.info(`Tracking template usage: ${templateId}, success: ${success}`);

        // Find template across all teams
        for (const team of this.teams.values()) {
            const template = team.templates.find(t => t.name === templateId);
            if (template) {
                template.usageMetrics.totalUsage++;
                if (success) {
                    template.usageMetrics.successfulUsage++;
                }
                if (rating) {
                    const currentRating = template.usageMetrics.averageRating;
                    const totalRatings = template.usageMetrics.totalUsage;
                    template.usageMetrics.averageRating = (currentRating * (totalRatings - 1) + rating) / totalRatings;
                }
                template.usageMetrics.lastUsed = new Date();
                template.updatedAt = new Date();
                break;
            }
        }

        await this.saveTeams();
    }

    public async getTeamAnalytics(teamId: string): Promise<TeamAnalytics> {
        const team = this.teams.get(teamId);
        if (!team) {
            throw new Error(`Team not found: ${teamId}`);
        }

        const analytics: TeamAnalytics = {
            totalMembers: team.members.length,
            totalTemplates: team.templates.length,
            approvedTemplates: team.templates.filter(t => t.approvalStatus === ApprovalStatus.APPROVED).length,
            pendingTemplates: team.templates.filter(t => t.approvalStatus === ApprovalStatus.PENDING).length,
            totalUsage: team.templates.reduce((sum, t) => sum + t.usageMetrics.totalUsage, 0),
            averageRating: team.templates.length > 0 
                ? team.templates.reduce((sum, t) => sum + t.usageMetrics.averageRating, 0) / team.templates.length 
                : 0,
            popularTemplates: team.templates
                .sort((a, b) => b.usageMetrics.totalUsage - a.usageMetrics.totalUsage)
                .slice(0, 5)
                .map(t => ({ name: t.name, usage: t.usageMetrics.totalUsage }))
        };

        return analytics;
    }

    public async exportTeamData(teamId: string): Promise<TeamExport> {
        const team = this.teams.get(teamId);
        if (!team) {
            throw new Error(`Team not found: ${teamId}`);
        }

        const exportData: TeamExport = {
            team: {
                id: team.id,
                name: team.name,
                description: team.description,
                settings: team.settings,
                createdAt: team.createdAt,
                updatedAt: team.updatedAt
            },
            members: team.members.map(m => ({
                email: m.email,
                name: m.name,
                role: m.role,
                joinedAt: m.joinedAt
            })),
            templates: team.templates.map(t => ({
                name: t.name,
                description: t.description,
                type: t.type,
                language: t.language,
                framework: t.framework,
                usageMetrics: t.usageMetrics,
                approvalStatus: t.approvalStatus,
                createdAt: t.createdAt
            }))
        };

        return exportData;
    }

    private generateTeamId(): string {
        return `team-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    private generateUserId(): string {
        return `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    private getDefaultPermissions(role: TeamRole): Permission[] {
        const permissions: Record<TeamRole, Permission[]> = {
            [TeamRole.OWNER]: [
                { resource: '*', actions: ['*'] }
            ],
            [TeamRole.ADMIN]: [
                { resource: 'templates', actions: ['read', 'write', 'approve'] },
                { resource: 'members', actions: ['read', 'invite'] },
                { resource: 'settings', actions: ['read', 'write'] }
            ],
            [TeamRole.MEMBER]: [
                { resource: 'templates', actions: ['read', 'write'] },
                { resource: 'members', actions: ['read'] }
            ],
            [TeamRole.VIEWER]: [
                { resource: 'templates', actions: ['read'] },
                { resource: 'members', actions: ['read'] }
            ]
        };

        return permissions[role] || [];
    }

    private addUserToTeam(userId: string, teamId: string): void {
        const userTeams = this.userTeams.get(userId) || [];
        if (!userTeams.includes(teamId)) {
            userTeams.push(teamId);
            this.userTeams.set(userId, userTeams);
        }
    }

    private async loadTeams(): Promise<void> {
        try {
            const teamsPath = path.join(this.storagePath, 'teams.json');
            if (await fs.pathExists(teamsPath)) {
                const data = await fs.readJson(teamsPath);
                this.teams = new Map(Object.entries(data.teams || {}));
                this.userTeams = new Map(Object.entries(data.userTeams || {}));
                this.logger.info(`Loaded ${this.teams.size} teams`);
            }
        } catch (error) {
            this.logger.error('Error loading teams', error as Error);
        }
    }

    private async saveTeams(): Promise<void> {
        try {
            await fs.ensureDir(this.storagePath);
            const teamsPath = path.join(this.storagePath, 'teams.json');
            
            const data = {
                teams: Object.fromEntries(this.teams),
                userTeams: Object.fromEntries(this.userTeams),
                lastUpdated: new Date().toISOString()
            };

            await fs.writeJson(teamsPath, data, { spaces: 2 });
            this.logger.debug('Teams saved successfully');
        } catch (error) {
            this.logger.error('Error saving teams', error as Error);
        }
    }
}

export interface TeamAnalytics {
    totalMembers: number;
    totalTemplates: number;
    approvedTemplates: number;
    pendingTemplates: number;
    totalUsage: number;
    averageRating: number;
    popularTemplates: Array<{ name: string; usage: number }>;
}

export interface TeamExport {
    team: {
        id: string;
        name: string;
        description: string;
        settings: TeamSettings;
        createdAt: Date;
        updatedAt: Date;
    };
    members: Array<{
        email: string;
        name: string;
        role: TeamRole;
        joinedAt: Date;
    }>;
    templates: Array<{
        name: string;
        description: string;
        type: string;
        language: string;
        framework?: string;
        usageMetrics: UsageMetrics;
        approvalStatus: ApprovalStatus;
        createdAt: Date;
    }>;
}
