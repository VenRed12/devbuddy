export type UserDeletionHandler = (userId: string) => Promise<void>;

export interface UserLifecycle {
  register(moduleName: string, onUserDeleted: UserDeletionHandler): void;
  runDeletion(userId: string): Promise<void>;
  getRegisteredModules(): string[];
}
