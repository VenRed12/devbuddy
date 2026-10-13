import type { UserDeletionHandler, UserLifecycle } from "../ports/lifecycle";

export class UserLifecycleRegistry implements UserLifecycle {
  private handlers = new Map<string, UserDeletionHandler>();

  register(moduleName: string, onUserDeleted: UserDeletionHandler): void {
    if (this.handlers.has(moduleName)) {
      throw new Error(`Handler for module "${moduleName}" is already registered.`);
    }
    this.handlers.set(moduleName, onUserDeleted);
  }

  async runDeletion(userId: string): Promise<void> {
    for (const [moduleName, handler] of this.handlers.entries()) {
      try {
        await handler(userId);
      } catch (err) {
        throw new Error(
          `User deletion failed in module "${moduleName}" for user "${userId}": ${
            err instanceof Error ? err.message : String(err)
          }`,
        );
      }
    }
  }

  getRegisteredModules(): string[] {
    return Array.from(this.handlers.keys());
  }
}
