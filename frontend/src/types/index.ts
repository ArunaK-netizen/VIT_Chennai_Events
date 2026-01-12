export interface Coordinator {
    _id: string;
    name?: string;
    email?: string;
    phone?: string;
}

export interface Club {
    _id: string;
    name: string;
    facultyCoordinators: Coordinator[];
    studentCoordinators: Coordinator[];
}

export interface Event {
    _id: string;
    name: string;
    description?: string;
    poster?: string;
    clubs: Club[]; // Populated in backend or handled appropriately
    isCollaboration: boolean;
    venue?: string;
    startDate: string; // Date string
    startTime?: string;
    endDate?: string;
    endTime?: string;
    fee: number;
    feePerPerson?: number;
    feeStructure?: Record<string, number>;
    groupSizeMin: number;
    groupSizeMax: number;
    registrationsOpen: boolean;
    isHidden: boolean;
    isPinned: boolean;
    studentCoordinators?: Coordinator[];
    facultyCoordinators?: Coordinator[];
}

export interface User {
    _id: string;
    name?: string;
    email: string;
    role: string;
    registrationNumber?: string;
    phoneNumber?: string;
    collegeName?: string;
    school?: string;
    isVITian?: boolean;
}

export interface Invitation {
    userId: User; // Populated
    status: 'pending' | 'accepted' | 'declined';
    token?: string;
    tokenExpires?: string;
}

export interface Registration {
    _id: string;
    event: Event; // Populated
    creator: User; // Populated
    teamMembers: User[]; // Populated
    invitationStatus: Invitation[];
    paymentStatus: string;
    paymentId?: string;
}
