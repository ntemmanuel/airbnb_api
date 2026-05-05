export interface User {
    id: number;
    name: string;
    email: string;
    username: string;
    phone: string;
    role: 'host' | 'guest';
    avatar?: string;
    bio?: string;
}
export declare const users: User[];
//# sourceMappingURL=user.model.d.ts.map