interface ResetPasswordEmailProps {
  name: string;
  email: string;
  actionLink: string;
  isPreview?: boolean;
}

export function getResetPasswordEmailHtml({
  name,
  email,
  actionLink,
  isPreview = false,
}: ResetPasswordEmailProps): string {
  const companyName = "Antonioni Grounds";
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const baseUrl = (configuredUrl && !configuredUrl.includes("localhost") ? configuredUrl : "https://agshop.lat").replace(/\/$/, "");
  const logoSrc = isPreview ? "/logo.png" : `${baseUrl}/logo.png`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Reset your password — Antonioni Grounds</title>
  <style>
    @media only screen and (max-width: 600px) {
      .outer-table { padding: 12px 6px !important; }
      .main-card { border-radius: 8px !important; }
      .header-padding { padding: 24px 16px 20px !important; }
      .logo-img { width: 130px !important; }
      .content-padding { padding: 28px 16px 32px !important; }
      .email-heading { font-size: 26px !important; margin-bottom: 12px !important; line-height: 1.15 !important; }
      .email-subtext { font-size: 14px !important; margin-bottom: 16px !important; }
      .summary-box { margin-bottom: 24px !important; }
      .cta-table { width: 100% !important; margin-bottom: 20px !important; }
      .cta-cell { display: block !important; width: 100% !important; }
      .cta-btn { display: block !important; width: 100% !important; text-align: center !important; box-sizing: border-box !important; padding: 14px 16px !important; font-size: 14px !important; }
      .footer-padding { padding: 28px 16px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #0d0d0d; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" class="outer-table" style="background-color: #0d0d0d; padding: 32px 12px; width: 100%;">
    <tr>
      <td align="center">
        <!-- Container -->
        <table width="600" cellpadding="0" cellspacing="0" class="main-card" style="background-color: #141414; border-radius: 12px; overflow: hidden; border: 1px solid #262626; max-width: 600px; width: 100%;">
          
          <!-- Header with Centered Logo -->
          <tr>
            <td align="center" class="header-padding" style="padding: 32px 28px 24px; background-color: #141414; border-bottom: 1px solid #262626; text-align: center;">
              <img src="${logoSrc}" alt="Antonioni Grounds Logo" class="logo-img" width="150" style="display: block; width: 150px; max-width: 100%; height: auto; margin: 0 auto; object-fit: contain;" />
            </td>
          </tr>

          <!-- Body Content Section -->
          <tr>
            <td class="content-padding" style="padding: 36px 28px 40px;">
              <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; color: #10b981; font-weight: 700; display: inline-block; margin-bottom: 8px;">
                Account Security
              </span>
              <h1 class="email-heading" style="margin: 0 0 16px; font-size: 32px; font-weight: 900; line-height: 1.15; letter-spacing: -0.01em; color: #ffffff; text-transform: uppercase; font-family: 'Helvetica Neue', Arial, sans-serif;">
                Reset your password
              </h1>

              <p class="email-subtext" style="margin: 0 0 12px; font-size: 15px; line-height: 1.6; color: #d4d4d8;">
                Hello <strong style="color: #ffffff;">${name}</strong>,
              </p>
              <p class="email-subtext" style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #d4d4d8;">
                We received a request to reset the password for your <strong style="color: #ffffff;">${companyName}</strong> reserve account.
              </p>
              <p class="email-subtext" style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #a1a1aa;">
                Click the button below to choose a new password. For security, this link will expire in <strong>1 hour</strong>.
              </p>

              <!-- Account Summary Box -->
              <table width="100%" cellpadding="0" cellspacing="0" class="summary-box" style="background-color: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 8px; margin-bottom: 28px; overflow: hidden; width: 100%;">
                <tr>
                  <td style="padding: 14px 18px;">
                    <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; color: #a1a1aa; font-weight: 700;">Account Target Email</span><br/>
                    <span style="font-size: 14px; font-weight: 600; color: #ffffff; margin-top: 3px; display: inline-block; word-break: break-all;">${email}</span>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" border="0" class="cta-table" style="margin-bottom: 24px; width: 100%;">
                <tr>
                  <td align="center" class="cta-cell" style="border-radius: 6px; background-color: #2E5A44;">
                    <a href="${actionLink}" target="_blank" class="cta-btn" style="font-size: 15px; font-weight: 700; color: #ffffff; text-decoration: none; padding: 15px 32px; display: inline-block; border-radius: 6px; font-family: sans-serif; letter-spacing: 0.02em; box-sizing: border-box; background-color: #2E5A44;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 16px; font-size: 12px; color: #71717a; word-break: break-word; line-height: 1.5;">
                Or copy and paste this secure link directly into your browser:<br/>
                <a href="${actionLink}" style="color: #34d399; text-decoration: underline; word-break: break-all;">${actionLink}</a>
              </p>

              <div style="border-top: 1px solid #262626; margin-top: 24px; padding-top: 16px;">
                <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #71717a;">
                  If you didn&apos;t request this password reset, please ignore this email. Your current password will remain unchanged and your account is completely safe.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer Section -->
          <tr>
            <td class="footer-padding" style="padding: 36px 28px; border-top: 1px solid #262626; background-color: #0a0a0a;">
              <p style="margin: 0 0 20px; font-size: 13px; line-height: 1.6; color: #a1a1aa; max-width: 420px;">
                ${companyName} brings you handcrafted specialty coffee, artisanal pastries, and unforgettable moments in Tiaong, Quezon.
              </p>
              
              <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 20px;">
                <tr>
                  <td style="padding-right: 20px;">
                    <a href="https://www.facebook.com/profile.php?id=61555257815663&rdid=pvuadDTJ2RZwQy4K&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1KExdzaSt5#" target="_blank" style="color: #ffffff; font-size: 12px; text-decoration: none; font-weight: 600;">Facebook</a>
                  </td>
                  <td style="padding-right: 20px;">
                    <a href="https://www.instagram.com/antonioni.grounds?igsh=MWR6MzBrNnplN2hubg==" target="_blank" style="color: #ffffff; font-size: 12px; text-decoration: none; font-weight: 600;">Instagram</a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 14px; font-size: 11px; line-height: 1.5; color: #71717a;">
                J.P Rizal Street, Poblacion 3<br />
                Tiaong, 4325 Quezon
              </p>

              <p style="margin: 0; font-size: 11px; line-height: 1.5; color: #52525b;">
                &copy; ${new Date().getFullYear()} ${companyName}. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
