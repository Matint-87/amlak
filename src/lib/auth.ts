export class AuthService {
  static async isAuthenticated(): Promise<boolean> {
    try {
      const res = await fetch("/api/admin/check", { cache: "no-store" });
      if (!res.ok) return false;
      const data = await res.json();
      return Boolean(data.authenticated);
    } catch (error) {
      console.error("❌ خطا در بررسی احراز هویت:", error);
      return false;
    }
  }

  static async login(password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error ?? "رمز عبور اشتباه است" };
      }

      return { success: true };
    } catch (error) {
      console.error("❌ خطا در ورود:", error);
      return { success: false, error: "خطا در ارتباط با سرور" };
    }
  }

  static async logout(): Promise<void> {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch (error) {
      console.error("❌ خطا در خروج:", error);
    }
  }
}
