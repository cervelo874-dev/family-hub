import { create } from 'zustand';
import { supabase } from './supabase';
import { RealtimeChannel } from '@supabase/supabase-js';
import {
    Member,
    Family,
    Message,
    Task,
    Log,
    CustomButton,
    MemberStatus,
    DEFAULT_CUSTOM_BUTTONS,
    DBProfile,
    DBLog,
    DBTask,
} from './types';

// Store Interface
interface FamilyStore {
    // State
    isOnboarded: boolean;
    family: Family | null;
    members: Member[];
    messages: Message[];
    tasks: Task[];
    logs: Log[];
    customButtons: CustomButton[];
    unreadTimelineCount: number;
    unreadMessagesCount: number;
    isLoading: boolean;
    realtimeSubscription: RealtimeChannel | null;

    // Actions - Initialization
    setSessionUser: (userId: string) => Promise<void>;
    fetchFamilyData: () => Promise<void>;
    subscribeToChanges: () => void;
    unsubscribeFromChanges: () => void;

    // Actions - Onboarding / Family
    createFamily: (name: string, members: Omit<Member, 'id'>[]) => Promise<void>;

    // Actions - Members
    addMember: (member: Omit<Member, 'id'>) => Promise<void>;
    updateMember: (id: string, updates: Partial<Member>) => Promise<void>;
    deleteMember: (id: string) => Promise<void>;
    updateMemberStatus: (id: string, status: MemberStatus) => Promise<void>;

    // Actions - Messages
    addMessage: (content: string, createdByMemberId: string, isPinned?: boolean) => Promise<void>;
    toggleMessagePin: (id: string) => Promise<void>;

    // Actions - Tasks
    addTask: (title: string, assignedToMemberId?: string) => Promise<void>;
    toggleTaskComplete: (id: string) => Promise<void>;
    deleteTask: (id: string) => Promise<void>;

    // Actions - Logs
    addLog: (log: Omit<Log, 'id' | 'familyId' | 'createdAt'>) => Promise<void>;
    deleteLog: (id: string) => Promise<void>;

    // Actions - Custom Buttons
    addCustomButton: (button: Omit<CustomButton, 'id' | 'familyId'>) => Promise<void>;

    // Actions - Notifications
    markTimelineAsRead: () => Promise<void>;
    markMessagesAsRead: () => Promise<void>;


    // Helpers
    getMemberById: (id: string) => Member | undefined;
    getPinnedMessage: () => Message | undefined;
    getAdultMembers: () => Member[];
    getIncompleteTasks: () => Task[];

    // Mock Init (Deprecated/Modified)
    initializeWithMockData: () => void;
}

export const useFamilyStore = create<FamilyStore>((set, get) => ({
    // Initial State
    isOnboarded: false,
    family: null,
    members: [],
    messages: [],
    tasks: [],
    logs: [],
    customButtons: [],
    unreadTimelineCount: 0,
    unreadMessagesCount: 0,
    isLoading: false,
    realtimeSubscription: null,

    // Actions - Initialization
    setSessionUser: async (userId: string) => {
        // Here we could fetch the user's profile to see if they belong to a family
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', userId) // Assuming we link auth user to profile via user_id
            .maybeSingle();

        if (profile && profile.family_id) {
            // Already in a family
            set({ isOnboarded: true });
            await get().fetchFamilyData();
            get().subscribeToChanges();
        }
    },

    fetchFamilyData: async () => {
        // ... (Logic kept same, but simplified for brevity in this tool call context, 
        // RE-INJECTING because tool 'write_to_file' overwrites the file!)
        // Wait, I should use multi_replace? No, 'write_to_file' overwrites.
        // I need to paste the FULL content including the new logic.

        set({ isLoading: true });
        try {
            // Fetch Family (Assuming user is associated with one via profile, but for now getting the first one linked or we rely on profile.family_id)
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Get current user's profile to find family_id
            let familyId: string | null = null;

            const { data: userProfile } = await supabase
                .from('profiles')
                .select('family_id')
                .eq('user_id', user.id)
                .single();

            if (userProfile) {
                familyId = userProfile.family_id;
            }

            if (!familyId) {
                set({ isLoading: false });
                return;
            }

            // Fetch Family Details
            const { data: family } = await supabase.from('families').select('*').eq('id', familyId).single();

            // Fetch Members
            const { data: dbProfiles } = await supabase.from('profiles').select('*').eq('family_id', familyId);

            // Fetch Logs
            const { data: dbLogs } = await supabase.from('logs').select('*').eq('family_id', familyId).order('created_at', { ascending: false });

            // Fetch Tasks
            const { data: dbTasks } = await supabase.from('tasks').select('*').eq('family_id', familyId).order('created_at', { ascending: false });

            // Fetch Custom Buttons
            const { data: dbButtons } = await supabase.from('custom_buttons').select('*').eq('family_id', familyId);

            if (family && dbProfiles) {
                set({
                    isOnboarded: true,
                    family: { id: family.id, name: family.name },
                    members: dbProfiles.map(p => ({
                        id: p.id,
                        name: p.name,
                        type: p.type as any,
                        themeColor: p.theme_color,
                        avatarIcon: '👤', // Fallback
                        avatarUrl: p.avatar_url,
                        status: p.status as any,
                        isAuthUser: p.is_auth_user,
                        lastViewedTimelineAt: p.last_viewed_timeline_at ? new Date(p.last_viewed_timeline_at) : undefined,
                        lastViewedMessagesAt: p.last_viewed_messages_at ? new Date(p.last_viewed_messages_at) : undefined,
                    })),
                    logs: (dbLogs || []).map(l => ({
                        id: l.id,
                        familyId: l.family_id,
                        type: l.type as any,
                        customButtonId: l.custom_button_id,
                        note: l.note,
                        photoUrl: l.photo_url,
                        targetMemberIds: l.target_member_ids || [],
                        createdByMemberId: l.created_by_member_id,
                        createdAt: new Date(l.created_at),
                    })),
                    tasks: (dbTasks || []).map(t => ({
                        id: t.id,
                        familyId: t.family_id,
                        title: t.title,
                        assignedToMemberId: t.assigned_to_member_id || null,
                        isCompleted: t.is_completed,
                        createdAt: new Date(t.created_at),
                    })),
                    customButtons: (dbButtons || []).map(b => ({
                        id: b.id,
                        familyId: b.family_id,
                        label: b.label,
                        icon: b.icon,
                    }))
                });

                // Calculate Unread Counts
                const authMember = dbProfiles.find(p => p.is_auth_user);
                if (authMember) {
                    const lastViewedTimeline = authMember.last_viewed_timeline_at ? new Date(authMember.last_viewed_timeline_at) : new Date(0);
                    // Messages not yet in DB, so logic effectively mocked or using local array if persisted, but mostly simple here.
                    // Actually messages are not in DB, so unreadMessagesCount will rely on local state if any.
                    // But for Timeline (logs):
                    const unreadLogs = (dbLogs || []).filter(l => new Date(l.created_at) > lastViewedTimeline).length;

                    set({ unreadTimelineCount: unreadLogs });
                }
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            set({ isLoading: false });
        }
    },

    subscribeToChanges: () => {
        const familyId = get().family?.id;
        if (!familyId || get().realtimeSubscription) return;

        const channel = supabase.channel(`family-${familyId}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: `family_id=eq.${familyId}` }, (payload) => {
                const { eventType, new: newRec, old: oldRec } = payload;
                if (eventType === 'INSERT') {
                    set(state => ({
                        members: [...state.members, {
                            id: newRec.id,
                            name: newRec.name,
                            type: newRec.type,
                            themeColor: newRec.theme_color,
                            avatarIcon: '👤',
                            avatarUrl: newRec.avatar_url,
                            status: newRec.status,
                        }]
                    }));
                } else if (eventType === 'UPDATE') {
                    set(state => ({
                        members: state.members.map(m => m.id === newRec.id ? {
                            ...m,
                            name: newRec.name,
                            type: newRec.type,
                            themeColor: newRec.theme_color,
                            avatarUrl: newRec.avatar_url,
                            status: newRec.status,
                        } : m)
                    }));
                } else if (eventType === 'DELETE') {
                    set(state => ({
                        members: state.members.filter(m => m.id !== oldRec.id)
                    }));
                }
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'logs', filter: `family_id=eq.${familyId}` }, (payload) => {
                const { eventType, new: newRec, old: oldRec } = payload;
                if (eventType === 'INSERT') {
                    // Since logs are typically time-ordered, inserting at start is usually better for UI, assuming prepending
                    const newLog: Log = {
                        id: newRec.id,
                        familyId: newRec.family_id,
                        type: newRec.type,
                        customButtonId: newRec.custom_button_id,
                        note: newRec.note,
                        photoUrl: newRec.photo_url,
                        targetMemberIds: newRec.target_member_ids || [],
                        createdByMemberId: newRec.created_by_member_id,
                        createdAt: new Date(newRec.created_at),
                    };
                    set(state => {
                        // Avoid duplicate if optimistic update already added it (not implementing optimistic ID matching yet, so might dup if not careful.
                        // Simple dup check:
                        if (state.logs.some(l => l.id === newLog.id)) return state;

                        // Increment unread count only if not created by self
                        const authMember = state.members.find(m => m.isAuthUser);
                        const isSelf = authMember && authMember.id === newLog.createdByMemberId;

                        return {
                            logs: [newLog, ...state.logs],
                            unreadTimelineCount: isSelf ? state.unreadTimelineCount : state.unreadTimelineCount + 1
                        };
                    });
                } else if (eventType === 'DELETE') {
                    set(state => ({
                        logs: state.logs.filter(l => l.id !== oldRec.id)
                    }));
                }
                // Updates to logs (not implemented in UI but supported technically)
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `family_id=eq.${familyId}` }, (payload) => {
                const { eventType, new: newRec, old: oldRec } = payload;
                if (eventType === 'INSERT') {
                    const newTask: Task = {
                        id: newRec.id,
                        familyId: newRec.family_id,
                        title: newRec.title,
                        assignedToMemberId: newRec.assigned_to_member_id,
                        isCompleted: newRec.is_completed,
                        createdAt: new Date(newRec.created_at),
                    };
                    set(state => ({ tasks: [newTask, ...state.tasks] }));
                } else if (eventType === 'UPDATE') {
                    set(state => ({
                        tasks: state.tasks.map(t => t.id === newRec.id ? {
                            ...t,
                            title: newRec.title,
                            isCompleted: newRec.is_completed,
                            assignedToMemberId: newRec.assigned_to_member_id
                        } : t)
                    }));
                } else if (eventType === 'DELETE') {
                    set(state => ({ tasks: state.tasks.filter(t => t.id !== oldRec.id) }));
                }
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'custom_buttons', filter: `family_id=eq.${familyId}` }, (payload) => {
                // Similar logic
                if (payload.eventType === 'INSERT') {
                    const newBtn = payload.new;
                    set(state => ({
                        customButtons: [...state.customButtons, {
                            id: newBtn.id,
                            familyId: newBtn.family_id,
                            label: newBtn.label,
                            icon: newBtn.icon
                        }]
                    }));
                }
            })
            .subscribe();

        set({ realtimeSubscription: channel });
    },

    unsubscribeFromChanges: () => {
        const sub = get().realtimeSubscription;
        if (sub) {
            supabase.removeChannel(sub);
            set({ realtimeSubscription: null });
        }
    },

    // Actions - Onboarding
    createFamily: async (name, members) => {
        set({ isLoading: true });
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 1. Create Family
        const { data: family, error: familyError } = await supabase
            .from('families')
            .insert({ name })
            .select()
            .single();

        if (familyError || !family) throw familyError;

        // 2. Create Profiles
        const profilesToInsert = members.map((m, index) => ({
            family_id: family.id,
            name: m.name,
            type: m.type,
            theme_color: m.themeColor,
            avatar_url: m.avatarUrl,
            status: m.status,
            user_id: index === 0 ? user.id : null,
            is_auth_user: index === 0,
        }));

        const { error: profilesError } = await supabase
            .from('profiles')
            .insert(profilesToInsert);

        if (profilesError) throw profilesError;

        // 3. Defaults
        const buttonsToInsert = DEFAULT_CUSTOM_BUTTONS.map(b => ({
            family_id: family.id,
            label: b.label,
            icon: b.icon
        }));

        await supabase.from('custom_buttons').insert(buttonsToInsert);

        await get().fetchFamilyData();
        get().subscribeToChanges();
    },

    // Actions - Members
    addMember: async (member) => {
        const familyId = get().family?.id;
        if (!familyId) return;

        await supabase.from('profiles').insert({
            family_id: familyId,
            name: member.name,
            type: member.type,
            theme_color: member.themeColor,
            avatar_url: member.avatarUrl,
            status: member.status,
        });
        // Realtime will handle state update
    },

    updateMember: async (id, updates) => {
        await supabase.from('profiles').update({
            name: updates.name,
            theme_color: updates.themeColor,
            avatar_url: updates.avatarUrl,
            status: updates.status,
        }).eq('id', id);
        // Realtime will handle state update
    },

    deleteMember: async (id) => {
        await supabase.from('profiles').delete().eq('id', id);
    },

    updateMemberStatus: async (id, status) => {
        // Optimistic update for immediate feedback
        set((state) => ({
            members: state.members.map((m) =>
                m.id === id ? { ...m, status } : m
            )
        }));
        await supabase.from('profiles').update({ status }).eq('id', id);
        // Realtime will confirm it
    },

    // Actions - Logs
    addLog: async (log) => {
        const familyId = get().family?.id;
        if (!familyId) return;

        // Upload photo if present (Base64 -> File -> Storage)
        let photoUrl = log.photoUrl;
        if (photoUrl && photoUrl.startsWith('data:')) {
            const res = await fetch(photoUrl);
            const blob = await res.blob();
            const fileName = `${familyId}/${Date.now()}.jpg`;

            const { data, error } = await supabase.storage
                .from('log-photos')
                .upload(fileName, blob);

            if (!error && data) {
                const { data: { publicUrl } } = supabase.storage
                    .from('log-photos')
                    .getPublicUrl(fileName);
                photoUrl = publicUrl;
            }
        }

        await supabase.from('logs').insert({
            family_id: familyId,
            type: log.type,
            custom_button_id: log.customButtonId,
            note: log.note,
            photo_url: photoUrl,
            created_by_member_id: log.createdByMemberId,
            target_member_ids: log.targetMemberIds,
        });
        // Realtime will handle state update
    },

    deleteLog: async (id) => {
        await supabase.from('logs').delete().eq('id', id);
        // Optimistic delete
        set((state) => ({
            logs: state.logs.filter((l) => l.id !== id),
        }));
    },

    // Actions - Tasks
    addTask: async (title, assignedToMemberId) => {
        const familyId = get().family?.id;
        if (!familyId) return;

        await supabase.from('tasks').insert({
            family_id: familyId,
            title,
            assigned_to_member_id: assignedToMemberId,
        });
    },

    toggleTaskComplete: async (id) => {
        const task = get().tasks.find(t => t.id === id);
        if (!task) return;

        // Optimistic update
        set((state) => ({
            tasks: state.tasks.map((t) =>
                t.id === id ? { ...t, isCompleted: !t.isCompleted } : t
            ),
        }));
        await supabase.from('tasks').update({ is_completed: !task.isCompleted }).eq('id', id);
    },

    deleteTask: async (id) => {
        await supabase.from('tasks').delete().eq('id', id);
        // Filter is handled by realtime DELETE event too, but optimistic is fine
        set((state) => ({
            tasks: state.tasks.filter((t) => t.id !== id),
        }));
    },

    addMessage: async (content, createdByMemberId, isPinned) => {
        console.warn('Messages table not yet in DB');
        set((state) => ({
            messages: [{
                id: crypto.randomUUID(),
                familyId: state.family?.id || '',
                content,
                createdByMemberId,
                isPinned: !!isPinned,
                createdAt: new Date()
            }, ...state.messages]
        }));
    },
    toggleMessagePin: async (id) => {
        set((state) => ({
            messages: state.messages.map((m) =>
                m.id === id ? { ...m, isPinned: !m.isPinned } : m
            ),
        }));
    },

    addCustomButton: async (button) => {
        const familyId = get().family?.id;
        if (!familyId) return;
        await supabase.from('custom_buttons').insert({
            family_id: familyId,
            label: button.label,
            icon: button.icon
        });
    },

    // Actions - Notifications
    markTimelineAsRead: async () => {
        const { members } = get();
        const authMember = members.find(m => m.isAuthUser);
        if (!authMember) return;

        const now = new Date();
        const nowIso = now.toISOString();

        set(state => ({
            members: state.members.map(m => m.id === authMember.id ? { ...m, lastViewedTimelineAt: now } : m),
            unreadTimelineCount: 0
        }));

        await supabase.from('profiles').update({ last_viewed_timeline_at: nowIso }).eq('id', authMember.id);
    },

    markMessagesAsRead: async () => {
        const { members } = get();
        const authMember = members.find(m => m.isAuthUser);
        if (!authMember) return;

        const now = new Date();
        const nowIso = now.toISOString();

        set(state => ({
            members: state.members.map(m => m.id === authMember.id ? { ...m, lastViewedMessagesAt: now } : m),
            unreadMessagesCount: 0
        }));

        await supabase.from('profiles').update({ last_viewed_messages_at: nowIso }).eq('id', authMember.id);
    },

    // Helpers
    getMemberById: (id) => get().members.find((m) => m.id === id),
    getPinnedMessage: () => get().messages.find((m) => m.isPinned),
    getAdultMembers: () => get().members.filter((m) => m.type === 'adult'),
    getIncompleteTasks: () => get().tasks.filter((t) => !t.isCompleted),

    initializeWithMockData: () => { },
}));
