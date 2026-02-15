import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import type { User, TimeEntry, Break, WorkStatus, AbsenceRequest } from '../types';
import { isDemoMode, setDemoMode, DEMO_USER, DEMO_USERS, DEMO_TIME_ENTRIES, DEMO_ABSENCES, DEMO_LIVE_ATTENDANCE } from '../lib/demoData';

interface AppState {
    // Auth
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    // Work status
    currentStatus: WorkStatus;
    activeTimeEntry: TimeEntry | null;
    activeBreak: Break | null;

    // Today's data
    todayEntries: TimeEntry[];
    todayHours: number;

    // Admin data
    allUsers: User[];
    liveAttendance: { user_id: string; full_name: string; clock_in: string }[];
    dailyAttendance: (TimeEntry & { profiles: { full_name: string } })[];
    employeeHistory: TimeEntry[];

    // Absence data
    absenceRequests: AbsenceRequest[];
    allAbsenceRequests: (AbsenceRequest & { profiles: { full_name: string } })[];

    // Reports data
    reports: {
        weeklyHours: { name: string; hours: number }[];
        breakdown: { name: string; value: number; color: string }[];
        stats: { label: string; value: string; change: string }[];
    } | null;

    // UI
    isDarkMode: boolean;
    language: 'es' | 'ca' | 'en';

    // Actions
    initialize: () => Promise<void>;
    demoLogin: () => void;
    setUser: (user: User | null) => void;
    setLoading: (loading: boolean) => void;

    clockIn: () => Promise<void>;
    clockOut: () => Promise<void>;
    startBreak: (type: Break['break_type']) => Promise<void>;
    endBreak: () => Promise<void>;
    fetchHistory: (range: 'week' | 'month' | 'all') => Promise<void>;

    // Admin actions
    fetchAllUsers: () => Promise<void>;
    updateUserRole: (userId: string, role: User['role']) => Promise<void>;
    toggleUserStatus: (userId: string, isActive: boolean) => Promise<void>;
    fetchLiveAttendance: () => Promise<void>;
    fetchDailyAttendance: (date: Date) => Promise<void>;
    fetchEmployeeHistory: (userId: string) => Promise<void>;
    adminCreateUser: (details: { email: string; password: string; firstName: string; lastName: string; phone: string; dni: string }) => Promise<{ success: boolean; error?: string }>;

    // Absence actions
    fetchAbsences: () => Promise<void>;
    requestAbsence: (request: Omit<AbsenceRequest, 'id' | 'user_id' | 'status' | 'created_at'>) => Promise<void>;
    fetchAllAbsences: () => Promise<void>;
    updateAbsenceStatus: (id: string, status: AbsenceRequest['status']) => Promise<void>;

    // Reports actions
    fetchReports: (period: 'week' | 'month' | 'year') => Promise<void>;

    toggleDarkMode: () => void;
    setLanguage: (lang: 'es' | 'ca' | 'en') => void;

    fetchTodayData: () => Promise<void>;
    updateTodayHours: () => void;
    logout: () => Promise<void>;
}

export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            // Initial state
            user: null,
            isAuthenticated: false,
            isLoading: true,

            currentStatus: 'not_working',
            activeTimeEntry: null,
            activeBreak: null,

            todayEntries: [],
            todayHours: 0,
            allUsers: [],
            liveAttendance: [],
            dailyAttendance: [],
            employeeHistory: [],
            absenceRequests: [],
            allAbsenceRequests: [],
            reports: null,

            isDarkMode: false,
            language: 'es',

            // Actions
            initialize: async () => {
                // If demo mode is active, skip Supabase
                if (isDemoMode) {
                    set({ isLoading: false });
                    return;
                }

                try {
                    const { data: { session } } = await supabase.auth.getSession();

                    if (session?.user) {
                        const { data: profile } = await supabase
                            .from('profiles')
                            .select('*, departments(*)')
                            .eq('id', session.user.id)
                            .single();

                        if (profile) {
                            set({ user: profile as User, isAuthenticated: true });
                            await get().fetchTodayData();
                        }
                    }
                } catch {
                    // Supabase not available
                }

                set({ isLoading: false });

                // Listen for auth changes
                try {
                    supabase.auth.onAuthStateChange(async (event, session) => {
                        if (event === 'SIGNED_IN' && session?.user) {
                            const { data: profile } = await supabase
                                .from('profiles')
                                .select('*, departments(*)')
                                .eq('id', session.user.id)
                                .single();

                            if (profile) {
                                set({ user: profile as User, isAuthenticated: true });
                                await get().fetchTodayData();
                            }
                        } else if (event === 'SIGNED_OUT') {
                            set({
                                user: null,
                                isAuthenticated: false,
                                currentStatus: 'not_working',
                                activeTimeEntry: null,
                                activeBreak: null,
                                todayEntries: [],
                                absenceRequests: [],
                                reports: null
                            });
                        }
                    });
                } catch {
                    // Supabase not available
                }
            },

            demoLogin: () => {
                setDemoMode(true);
                const todayEntries = DEMO_TIME_ENTRIES.filter(e => {
                    const entryDate = new Date(e.clock_in);
                    const now = new Date();
                    return entryDate.toDateString() === now.toDateString();
                });
                const activeEntry = todayEntries.find(e => !e.clock_out) || null;

                set({
                    user: DEMO_USER,
                    isAuthenticated: true,
                    isLoading: false,
                    todayEntries,
                    activeTimeEntry: activeEntry as TimeEntry | null,
                    activeBreak: null,
                    currentStatus: activeEntry ? 'working' : 'not_working',
                    absenceRequests: DEMO_ABSENCES.filter(a => a.user_id === DEMO_USER.id),
                    allUsers: DEMO_USERS,
                });
                get().updateTodayHours();
            },

            setUser: (user) => set({
                user,
                isAuthenticated: !!user,
                isLoading: false
            }),

            setLoading: (loading) => set({ isLoading: loading }),

            fetchTodayData: async () => {
                const user = get().user;
                if (!user) return;

                if (isDemoMode) {
                    const todayEntries = DEMO_TIME_ENTRIES.filter(e => {
                        const d = new Date(e.clock_in);
                        const now = new Date();
                        return d.toDateString() === now.toDateString() && e.user_id === user.id;
                    });
                    const activeEntry = todayEntries.find(e => !e.clock_out) || null;
                    set({
                        todayEntries,
                        activeTimeEntry: activeEntry as TimeEntry | null,
                        activeBreak: null,
                        currentStatus: activeEntry ? 'working' : 'not_working',
                    });
                    get().updateTodayHours();
                    return;
                }

                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const { data: entries } = await supabase
                    .from('time_entries')
                    .select('*, breaks(*)')
                    .eq('user_id', user.id)
                    .gte('clock_in', today.toISOString())
                    .order('clock_in', { ascending: false });

                if (entries) {
                    const activeEntry = (entries as any[]).find(e => !e.clock_out);
                    const activeBreak = activeEntry?.breaks?.find((b: any) => !b.end_time);

                    set({
                        todayEntries: entries as TimeEntry[],
                        activeTimeEntry: (activeEntry as TimeEntry) || null,
                        activeBreak: (activeBreak as Break) || null,
                        currentStatus: activeBreak ? 'on_break' : activeEntry ? 'working' : 'not_working'
                    });
                    get().updateTodayHours();
                }
            },

            clockIn: async () => {
                const user = get().user;
                if (!user) return;

                if (isDemoMode) {
                    const newEntry: TimeEntry = {
                        id: `te-demo-${Date.now()}`,
                        user_id: user.id,
                        clock_in: new Date().toISOString(),
                        is_modified: false,
                        created_at: new Date().toISOString(),
                        breaks: [],
                    };
                    set({
                        activeTimeEntry: newEntry,
                        currentStatus: 'working',
                        todayEntries: [newEntry, ...get().todayEntries],
                    });
                    return;
                }

                const { data, error } = await supabase
                    .from('time_entries')
                    .insert([{ user_id: user.id, clock_in: new Date().toISOString() }])
                    .select()
                    .single();

                if (data && !error) {
                    set({
                        activeTimeEntry: data as TimeEntry,
                        currentStatus: 'working',
                        todayEntries: [data as TimeEntry, ...get().todayEntries]
                    });
                }
            },

            clockOut: async () => {
                const activeEntry = get().activeTimeEntry;
                if (!activeEntry) return;

                if (isDemoMode) {
                    const updated = { ...activeEntry, clock_out: new Date().toISOString() };
                    set({
                        activeTimeEntry: null,
                        currentStatus: 'not_working',
                        todayEntries: get().todayEntries.map(e =>
                            e.id === activeEntry.id ? updated : e
                        ),
                    });
                    get().updateTodayHours();
                    return;
                }

                const { data, error } = await supabase
                    .from('time_entries')
                    .update({ clock_out: new Date().toISOString() })
                    .eq('id', activeEntry.id)
                    .select()
                    .single();

                if (data && !error) {
                    set({
                        activeTimeEntry: null,
                        currentStatus: 'not_working',
                        todayEntries: get().todayEntries.map(e =>
                            e.id === activeEntry.id ? (data as TimeEntry) : e
                        )
                    });
                    get().updateTodayHours();
                }
            },

            startBreak: async (type) => {
                const activeEntry = get().activeTimeEntry;
                if (!activeEntry) return;

                if (isDemoMode) {
                    const newBreak: Break = {
                        id: `br-demo-${Date.now()}`,
                        time_entry_id: activeEntry.id,
                        break_type: type,
                        start_time: new Date().toISOString(),
                    };
                    set({ activeBreak: newBreak, currentStatus: 'on_break' });
                    return;
                }

                const { data, error } = await supabase
                    .from('breaks')
                    .insert([{
                        time_entry_id: activeEntry.id,
                        break_type: type,
                        start_time: new Date().toISOString()
                    }])
                    .select()
                    .single();

                if (data && !error) {
                    set({
                        activeBreak: data as Break,
                        currentStatus: 'on_break'
                    });
                }
            },

            endBreak: async () => {
                const activeBreak = get().activeBreak;
                if (!activeBreak) return;

                if (isDemoMode) {
                    set({ activeBreak: null, currentStatus: 'working' });
                    return;
                }

                const { error } = await supabase
                    .from('breaks')
                    .update({ end_time: new Date().toISOString() })
                    .eq('id', activeBreak.id);

                if (!error) {
                    set({
                        activeBreak: null,
                        currentStatus: 'working'
                    });
                }
            },

            fetchHistory: async (range) => {
                const user = get().user;
                if (!user) return;

                if (isDemoMode) {
                    let entries = DEMO_TIME_ENTRIES.filter(e => e.user_id === user.id);
                    if (range === 'week') {
                        const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 7);
                        entries = entries.filter(e => new Date(e.clock_in) >= cutoff);
                    } else if (range === 'month') {
                        const cutoff = new Date(); cutoff.setMonth(cutoff.getMonth() - 1);
                        entries = entries.filter(e => new Date(e.clock_in) >= cutoff);
                    }
                    set({ todayEntries: entries });
                    get().updateTodayHours();
                    return;
                }

                let query = supabase.from('time_entries').select('*, breaks(*)').eq('user_id', user.id);

                if (range === 'week') {
                    const lastWeek = new Date();
                    lastWeek.setDate(lastWeek.getDate() - 7);
                    query = query.gte('clock_in', lastWeek.toISOString());
                } else if (range === 'month') {
                    const lastMonth = new Date();
                    lastMonth.setMonth(lastMonth.getMonth() - 1);
                    query = query.gte('clock_in', lastMonth.toISOString());
                }

                const { data } = await query.order('clock_in', { ascending: false });
                if (data) {
                    set({ todayEntries: data as TimeEntry[] });
                    get().updateTodayHours();
                }
            },

            fetchAllUsers: async () => {
                if (isDemoMode) {
                    set({ allUsers: DEMO_USERS });
                    return;
                }

                const { data, error } = await supabase
                    .from('profiles')
                    .select('*, departments(name)')
                    .order('full_name');

                if (data && !error) {
                    set({ allUsers: data as User[] });
                }
            },

            updateUserRole: async (userId, role) => {
                const { error } = await supabase
                    .from('profiles')
                    .update({ role })
                    .eq('id', userId);

                if (!error) {
                    set({
                        allUsers: get().allUsers.map(u =>
                            u.id === userId ? { ...u, role } : u
                        )
                    });
                }
            },

            toggleUserStatus: async (userId, is_active) => {
                const { error } = await supabase
                    .from('profiles')
                    .update({ is_active })
                    .eq('id', userId);

                if (!error) {
                    set({
                        allUsers: get().allUsers.map(u =>
                            u.id === userId ? { ...u, is_active } : u
                        )
                    });
                }
            },

            fetchLiveAttendance: async () => {
                if (isDemoMode) {
                    set({ liveAttendance: DEMO_LIVE_ATTENDANCE });
                    return;
                }

                const { data, error } = await supabase
                    .from('time_entries')
                    .select('clock_in, profiles(id, full_name)')
                    .is('clock_out', null);

                if (data && !error) {
                    const formatted = (data as any[]).map(entry => ({
                        user_id: entry.profiles?.id,
                        full_name: entry.profiles?.full_name,
                        clock_in: entry.clock_in
                    }));
                    set({ liveAttendance: formatted });
                }
            },

            fetchDailyAttendance: async (date) => {
                const startOfDay = new Date(date);
                startOfDay.setHours(0, 0, 0, 0);
                const endOfDay = new Date(date);
                endOfDay.setHours(23, 59, 59, 999);

                const { data, error } = await supabase
                    .from('time_entries')
                    .select('*, profiles(full_name), breaks(*)')
                    .gte('clock_in', startOfDay.toISOString())
                    .lte('clock_in', endOfDay.toISOString())
                    .order('clock_in', { ascending: false });

                if (data && !error) {
                    set({ dailyAttendance: data as any[] });
                }
            },

            fetchEmployeeHistory: async (userId) => {
                const { data, error } = await supabase
                    .from('time_entries')
                    .select('*, breaks(*)')
                    .eq('user_id', userId)
                    .order('clock_in', { ascending: false })
                    .limit(50);

                if (data && !error) {
                    set({ employeeHistory: data as TimeEntry[] });
                }
            },

            adminCreateUser: async ({ email, password, firstName, lastName, phone, dni }) => {
                const { data, error } = await supabase.functions.invoke('create-user', {
                    body: { email, password, firstName, lastName, phone, dni }
                });

                if (error) {
                    return { success: false, error: error.message };
                }

                if (data?.error) {
                    return { success: false, error: data.error };
                }

                // Refresh users list
                await get().fetchAllUsers();
                return { success: true };
            },

            fetchAbsences: async () => {
                const user = get().user;
                if (!user) return;

                if (isDemoMode) {
                    set({ absenceRequests: DEMO_ABSENCES.filter(a => a.user_id === user.id) });
                    return;
                }

                const { data, error } = await supabase
                    .from('absence_requests')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('start_date', { ascending: false });

                if (data && !error) {
                    set({ absenceRequests: data as AbsenceRequest[] });
                }
            },

            requestAbsence: async (request) => {
                const user = get().user;
                if (!user) return;

                const { data, error } = await supabase
                    .from('absence_requests')
                    .insert([{ ...request, user_id: user.id, status: 'pending' }])
                    .select()
                    .single();

                if (data && !error) {
                    set({ absenceRequests: [data as AbsenceRequest, ...get().absenceRequests] });
                }
            },

            fetchAllAbsences: async () => {
                if (isDemoMode) {
                    const withNames = DEMO_ABSENCES.map(a => ({
                        ...a,
                        profiles: { full_name: DEMO_USERS.find(u => u.id === a.user_id)?.full_name || 'Desconocido' },
                    }));
                    set({ allAbsenceRequests: withNames as any[] });
                    return;
                }

                const { data, error } = await supabase
                    .from('absence_requests')
                    .select('*, profiles(full_name)')
                    .order('created_at', { ascending: false });

                if (data && !error) {
                    set({ allAbsenceRequests: data as any[] });
                }
            },

            updateAbsenceStatus: async (id, status) => {
                const user = get().user;
                if (!user) return;

                const { error } = await supabase
                    .from('absence_requests')
                    .update({
                        status,
                        reviewed_by: user.id,
                        reviewed_at: new Date().toISOString()
                    })
                    .eq('id', id);

                if (!error) {
                    set({
                        allAbsenceRequests: get().allAbsenceRequests.map(a =>
                            a.id === id ? { ...a, status } : a
                        )
                    });
                }
            },

            fetchReports: async (period) => {
                const user = get().user;
                if (!user) return;

                // Use demo entries or fetch from Supabase
                let entries: any[] = [];

                if (isDemoMode) {
                    entries = DEMO_TIME_ENTRIES.filter(e => e.user_id === user.id);
                    const now = new Date();
                    if (period === 'week') {
                        const startOfWeek = new Date(now);
                        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
                        startOfWeek.setHours(0, 0, 0, 0);
                        entries = entries.filter(e => new Date(e.clock_in) >= startOfWeek);
                    } else if (period === 'month') {
                        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                        entries = entries.filter(e => new Date(e.clock_in) >= startOfMonth);
                    }
                } else {
                    let query = supabase.from('time_entries').select('*, breaks(*)').eq('user_id', user.id);

                    const now = new Date();
                    if (period === 'week') {
                        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 1));
                        startOfWeek.setHours(0, 0, 0, 0);
                        query = query.gte('clock_in', startOfWeek.toISOString());
                    } else if (period === 'month') {
                        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                        query = query.gte('clock_in', startOfMonth.toISOString());
                    }

                    const { data, error } = await query.order('clock_in', { ascending: true });
                    if (!data || error) return;
                    entries = data;
                }

                const days = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];
                const hoursByDay = days.map(name => ({ name, hours: 0 }));
                let totalHours = 0;
                let totalBreaks = 0;

                entries.forEach((entry: any) => {
                    if (entry.clock_out) {
                        const start = new Date(entry.clock_in);
                        const end = new Date(entry.clock_out);
                        const dayIndex = (start.getDay() + 6) % 7;
                        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

                        hoursByDay[dayIndex].hours += hours;
                        totalHours += hours;

                        entry.breaks?.forEach((b: any) => {
                            if (b.end_time) {
                                totalBreaks += (new Date(b.end_time).getTime() - new Date(b.start_time).getTime()) / (1000 * 60 * 60);
                            }
                        });
                    }
                });

                set({
                    reports: {
                        weeklyHours: hoursByDay.map(d => ({ ...d, hours: Number(d.hours.toFixed(1)) })),
                        breakdown: [
                            { name: 'Tiempo trabajado', value: Number((totalHours - totalBreaks).toFixed(1)), color: '#5a6b5a' },
                            { name: 'Pausas', value: Number(totalBreaks.toFixed(1)), color: '#f59e0b' }
                        ],
                        stats: [
                            { label: 'Total horas', value: `${totalHours.toFixed(1)}h`, change: '' },
                            { label: 'Media diaria', value: `${(totalHours / (totalHours > 0 ? new Set(entries.map((d: any) => d.clock_in.split('T')[0])).size : 1)).toFixed(1)}h`, change: '' },
                            { label: 'Días trabajados', value: `${new Set(entries.map((d: any) => d.clock_in.split('T')[0])).size}`, change: '' },
                            { label: 'Pausas totales', value: `${totalBreaks.toFixed(1)}h`, change: '' }
                        ]
                    }
                });
            },

            toggleDarkMode: () => set({ isDarkMode: !get().isDarkMode }),

            setLanguage: (lang) => set({ language: lang }),

            updateTodayHours: () => {
                const entries = get().todayEntries;
                let totalMinutes = 0;

                entries.forEach(entry => {
                    if (entry.clock_out) {
                        const start = new Date(entry.clock_in);
                        const end = new Date(entry.clock_out);
                        totalMinutes += (end.getTime() - start.getTime()) / (1000 * 60);
                    }
                });

                set({ todayHours: totalMinutes / 60 });
            },

            logout: async () => {
                if (!isDemoMode) {
                    try { await supabase.auth.signOut(); } catch { /* ignore */ }
                }
                setDemoMode(false);
                set({
                    user: null,
                    isAuthenticated: false,
                    activeTimeEntry: null,
                    activeBreak: null,
                    currentStatus: 'not_working',
                    todayEntries: [],
                    todayHours: 0,
                    allUsers: [],
                    absenceRequests: [],
                    reports: null
                });
            }
        }),
        {
            name: 'timetrack-storage',
            partialize: (state) => ({
                isDarkMode: state.isDarkMode,
                language: state.language
            })
        }
    )
);
