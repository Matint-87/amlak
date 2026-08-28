// مدیریت احراز هویت ادمین
// نکته امنیتی مهم: قبلاً رمز عبور مستقیم داخل کد سمت کلاینت نوشته شده بود و
// در باندل جاوااسکریپت قابل مشاهده بود (هرکسی می‌توانست با "مشاهده Source" آن را ببیند).
// الان رمز فقط داخل .env.local روی سرور نگه‌داری می‌شود و بررسی آن هم سمت سرور
// (در src/app/api/admin/login) انجام می‌گیرد. کلاینت فقط یک کوکی httpOnly امن دریافت می‌کند
// که خودِ جاوااسکریپت هم نمی‌تواند آن را بخواند یا جعل کند.
export class AuthService {
  // بررسی آیا کاربر لاگین کرده یا نه (از سرور می‌پرسیم چون کوکی httpOnly است)
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

  // لاگین کردن
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

  // لاگاوت کردن
  static async logout(): Promise<void> {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch (error) {
      console.error("❌ خطا در خروج:", error);
    }
  }
}
