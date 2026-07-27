interface SignupEmailProps {
  name: string;
  username: string;
  email: string;
  actionLink: string;
  isPreview?: boolean;
}

export function getSignupEmailHtml({
  name,
  username,
  email,
  actionLink,
  isPreview = false,
}: SignupEmailProps): string {
  const companyName = "Antonioni Grounds";
  const logoSrc = isPreview ? "/logo.png" : "cid:logo";
  const heroSrc = isPreview ? "/hero.png" : "cid:hero";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Confirm your email — Antonioni Grounds</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0d0d0d; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0d0d0d; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Container -->
        <table width="640" cellpadding="0" cellspacing="0" style="background-color: #141414; border-radius: 12px; overflow: hidden; border: 1px solid #262626; max-width: 100%;">
          
          <!-- Header with Logo at top (Centered & Enlarged) -->
          <tr>
            <td align="center" style="padding: 36px 32px 28px; background-color: #141414; border-bottom: 1px solid #262626; text-align: center;">
              <img src="${logoSrc}" alt="Antonioni Grounds Logo" width="160" style="display: block; width: 160px; max-width: 100%; height: auto; margin: 0 auto; object-fit: contain;" />
            </td>
          </tr>

          <!-- Banner Image Section (Reduced Height) -->
          <tr>
            <td style="padding: 24px 32px 0;">
              <img src="${heroSrc}" alt="Antonioni Grounds Coffee" width="576" height="240" style="display: block; width: 100%; max-width: 576px; height: 240px; object-fit: cover; border-radius: 8px; border: 1px solid #262626;" />
            </td>
          </tr>

          <!-- Body Content Section -->
          <tr>
            <td style="padding: 40px 32px 48px;">
              <h1 style="margin: 0 0 18px; font-size: 48px; font-weight: 900; line-height: 1.05; letter-spacing: -0.02em; color: #ffffff; text-transform: uppercase; font-family: 'Helvetica Neue', Arial, sans-serif;">
                almost there
              </h1>

              <p style="margin: 0 0 6px; font-size: 15px; line-height: 1.6; color: #d4d4d8;">
                Thank you for signing up for <strong style="color: #ffffff;">${companyName}</strong>.
              </p>
              <p style="margin: 0 0 6px; font-size: 15px; line-height: 1.6; color: #d4d4d8;">
                To verify your account, we just need to confirm your email.
              </p>
              <p style="margin: 18px 0 28px; font-size: 13px; line-height: 1.5; color: #71717a;">
                If you didn&apos;t create an account, you can safely ignore this email.
              </p>

              <!-- Account Summary Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 8px; margin-bottom: 32px; overflow: hidden;">
                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #2a2a2a;">
                    <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; color: #a1a1aa; font-weight: 700;">Account Name</span><br/>
                    <span style="font-size: 14px; font-weight: 600; color: #ffffff; margin-top: 2px; display: inline-block;">${name}</span>
                  </td>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #2a2a2a; text-align: right;">
                    <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; color: #a1a1aa; font-weight: 700;">Username</span><br/>
                    <span style="font-size: 14px; font-weight: 600; color: #ffffff; margin-top: 2px; display: inline-block;">@${username}</span>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding: 14px 18px;">
                    <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; color: #a1a1aa; font-weight: 700;">Email Address</span><br/>
                    <span style="font-size: 14px; font-weight: 600; color: #ffffff; margin-top: 2px; display: inline-block;">${email}</span>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
                <tr>
                  <td align="center" style="border-radius: 4px; background-color: #ffffff;">
                    <a href="${actionLink}" target="_blank" style="font-size: 15px; font-weight: 700; color: #000000; text-decoration: none; padding: 14px 28px; display: inline-block; border-radius: 4px; font-family: sans-serif; letter-spacing: 0.01em;">
                      Confirm Email
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 12px; color: #71717a;">
                Or copy this verification link to your browser:<br/>
                <a href="${actionLink}" style="color: #a1a1aa; text-decoration: underline; word-break: break-all;">${actionLink}</a>
              </p>
            </td>
          </tr>

          <!-- Footer Section -->
          <tr>
            <td style="padding: 40px 32px; border-top: 1px solid #262626; background-color: #0a0a0a;">
              <p style="margin: 0 0 24px; font-size: 13px; line-height: 1.6; color: #a1a1aa; max-width: 420px;">
                ${companyName} brings you handcrafted specialty coffee, artisanal pastries, and unforgettable moments in Tiaong, Quezon.
              </p>
              
              <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="padding-right: 20px;">
                    <a href="https://www.facebook.com/profile.php?id=61555257815663&rdid=pvuadDTJ2RZwQy4K&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1KExdzaSt5#" target="_blank" style="color: #ffffff; font-size: 12px; text-decoration: none; font-weight: 600;">Facebook</a>
                  </td>
                  <td style="padding-right: 20px;">
                    <a href="https://www.instagram.com/antonioni.grounds?igsh=MWR6MzBrNnplN2hubg==" target="_blank" style="color: #ffffff; font-size: 12px; text-decoration: none; font-weight: 600;">Instagram</a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 16px; font-size: 11px; line-height: 1.5; color: #71717a;">
                J.P Rizal Street, Poblacion 3<br />
                Tiaong, 4325 Quezon
              </p>

              <p style="margin: 0; font-size: 11px; line-height: 1.5; color: #52525b;">
                <a href="#" style="color: #71717a; text-decoration: underline;">Unsubscribe</a> from ${companyName} marketing emails.<br/>
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
