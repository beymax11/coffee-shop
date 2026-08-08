interface ReservationInfo {
  id: string;
  fullName: string;
  email: string;
  eventType: string;
  date: string;
  time: string;
  guestCount: number;
  location: string;
  notes?: string;
}

const companyName = "Antonioni Grounds";
const fbUrl = "https://www.facebook.com/profile.php?id=61555257815663&rdid=pvuadDTJ2RZwQy4K&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1KExdzaSt5#";
const igUrl = "https://www.instagram.com/antonioni.grounds?igsh=MWR6MzBrNnplN2hubg==";

function renderResponsiveStyles() {
  return `
    <style>
      @media only screen and (max-width: 600px) {
        .outer-table { padding: 12px 6px !important; }
        .main-card { border-radius: 8px !important; }
        .header-padding { padding: 24px 16px 20px !important; }
        .logo-img { width: 130px !important; }
        .banner-padding { padding: 16px 16px 0 !important; }
        .hero-img { height: 160px !important; border-radius: 6px !important; }
        .content-padding { padding: 24px 16px 32px !important; }
        .email-heading { font-size: 24px !important; margin-bottom: 12px !important; line-height: 1.2 !important; }
        .email-subtext { font-size: 14px !important; margin-bottom: 20px !important; }
        .summary-box { margin-bottom: 20px !important; }
        .summary-col { display: block !important; width: 100% !important; box-sizing: border-box !important; text-align: left !important; padding: 10px 14px !important; border-right: none !important; }
        .summary-col-border { border-bottom: 1px solid #2a2a2a !important; }
        .payment-box { padding: 16px 14px !important; margin-bottom: 20px !important; }
        .cta-table { width: 100% !important; margin-bottom: 20px !important; }
        .cta-cell { display: block !important; width: 100% !important; }
        .cta-btn { display: block !important; width: 100% !important; text-align: center !important; box-sizing: border-box !important; padding: 14px 16px !important; font-size: 14px !important; }
        .footer-padding { padding: 28px 16px !important; }
      }
    </style>
  `;
}

function renderCommonHeader(isPreview = false) {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://agshop.lat").replace(/\/$/, "");
  const logoSrc = isPreview ? "/logo.png" : `${baseUrl}/logo.png`;
  const heroSrc = isPreview ? "/hero.png" : `${baseUrl}/hero.png`;
  return `
          <!-- Header with Logo at top (Centered) -->
          <tr>
            <td align="center" class="header-padding" style="padding: 32px 28px 24px; background-color: #141414; border-bottom: 1px solid #262626; text-align: center;">
              <img src="${logoSrc}" alt="Antonioni Grounds Logo" class="logo-img" width="150" style="display: block; width: 150px; max-width: 100%; height: auto; margin: 0 auto; object-fit: contain;" />
            </td>
          </tr>

          <!-- Banner Image Section -->
          <tr>
            <td class="banner-padding" style="padding: 20px 24px 0;">
              <img src="${heroSrc}" alt="Antonioni Grounds Coffee" class="hero-img" width="592" height="220" style="display: block; width: 100%; max-width: 100%; height: auto; max-height: 220px; object-fit: cover; border-radius: 8px; border: 1px solid #262626;" />
            </td>
          </tr>
  `;
}

function renderCommonFooter() {
  return `
          <!-- Footer Section -->
          <tr>
            <td class="footer-padding" style="padding: 36px 28px; border-top: 1px solid #262626; background-color: #0a0a0a;">
              <p style="margin: 0 0 20px; font-size: 13px; line-height: 1.6; color: #a1a1aa; max-width: 420px;">
                ${companyName} brings you handcrafted specialty coffee, artisanal pastries, and unforgettable moments in Tiaong, Quezon.
              </p>
              
              <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 20px;">
                <tr>
                  <td style="padding-right: 20px;">
                    <a href="${fbUrl}" target="_blank" style="color: #ffffff; font-size: 12px; text-decoration: none; font-weight: 600;">Facebook</a>
                  </td>
                  <td style="padding-right: 20px;">
                    <a href="${igUrl}" target="_blank" style="color: #ffffff; font-size: 12px; text-decoration: none; font-weight: 600;">Instagram</a>
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
  `;
}

function renderBookingSummaryBox(reservation: ReservationInfo) {
  return `
              <!-- Booking Summary Box -->
              <table width="100%" cellpadding="0" cellspacing="0" class="summary-box" style="background-color: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 8px; margin-bottom: 24px; overflow: hidden; width: 100%;">
                <tr>
                  <td class="summary-col summary-col-border" width="50%" style="padding: 12px 16px; border-bottom: 1px solid #2a2a2a; vertical-align: top;">
                    <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; color: #a1a1aa; font-weight: 700;">Guest Name</span><br/>
                    <span style="font-size: 14px; font-weight: 600; color: #ffffff; margin-top: 2px; display: inline-block;">${reservation.fullName}</span>
                  </td>
                  <td class="summary-col summary-col-border" width="50%" style="padding: 12px 16px; border-bottom: 1px solid #2a2a2a; text-align: right; vertical-align: top;">
                    <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; color: #a1a1aa; font-weight: 700;">Experience</span><br/>
                    <span style="font-size: 14px; font-weight: 600; color: #ffffff; margin-top: 2px; display: inline-block;">${reservation.eventType}</span>
                  </td>
                </tr>
                <tr>
                  <td class="summary-col summary-col-border" width="50%" style="padding: 12px 16px; border-bottom: 1px solid #2a2a2a; vertical-align: top;">
                    <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; color: #a1a1aa; font-weight: 700;">Date</span><br/>
                    <span style="font-size: 14px; font-weight: 600; color: #ffffff; margin-top: 2px; display: inline-block;">${reservation.date}</span>
                  </td>
                  <td class="summary-col summary-col-border" width="50%" style="padding: 12px 16px; border-bottom: 1px solid #2a2a2a; text-align: right; vertical-align: top;">
                    <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; color: #a1a1aa; font-weight: 700;">Time</span><br/>
                    <span style="font-size: 14px; font-weight: 600; color: #ffffff; font-family: monospace; margin-top: 2px; display: inline-block;">${reservation.time}</span>
                  </td>
                </tr>
                <tr>
                  <td class="summary-col summary-col-border" width="50%" style="padding: 12px 16px; vertical-align: top;">
                    <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; color: #a1a1aa; font-weight: 700;">Guests</span><br/>
                    <span style="font-size: 14px; font-weight: 600; color: #ffffff; margin-top: 2px; display: inline-block;">${reservation.guestCount} guest${reservation.guestCount > 1 ? "s" : ""}</span>
                  </td>
                  <td class="summary-col" width="50%" style="padding: 12px 16px; text-align: right; vertical-align: top;">
                    <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; color: #a1a1aa; font-weight: 700;">Location</span><br/>
                    <span style="font-size: 14px; font-weight: 600; color: #ffffff; margin-top: 2px; display: inline-block;">${reservation.location}</span>
                  </td>
                </tr>
              </table>
  `;
}

// 0. RECEIVED / PENDING REVIEW EMAIL TEMPLATE
export function getReceivedEmailHtml({
  reservation,
  amount,
  totalLabel,
  reservationLink,
  isPreview = false,
}: {
  reservation: ReservationInfo;
  amount: string;
  totalLabel: string;
  reservationLink: string;
  isPreview?: boolean;
}) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Booking Received — Antonioni Grounds</title>
  ${renderResponsiveStyles()}
</head>
<body style="margin: 0; padding: 0; background-color: #0d0d0d; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" class="outer-table" style="background-color: #0d0d0d; padding: 32px 12px; width: 100%;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" class="main-card" style="background-color: #141414; border-radius: 12px; overflow: hidden; border: 1px solid #262626; max-width: 600px; width: 100%;">
          
          ${renderCommonHeader(isPreview)}

          <!-- Content Section -->
          <tr>
            <td class="content-padding" style="padding: 36px 28px 40px;">
              <h1 class="email-heading" style="margin: 0 0 14px; font-size: 28px; font-weight: 900; line-height: 1.15; letter-spacing: -0.01em; color: #ffffff; text-transform: uppercase; font-family: 'Helvetica Neue', Arial, sans-serif;">
                BOOKING RECEIVED &#10003;
              </h1>

              <p class="email-subtext" style="margin: 0 0 20px; font-size: 15px; line-height: 1.6; color: #d4d4d8;">
                Thank you for choosing Antonioni Grounds. Your reservation request has been received and is now <strong style="color: #ffffff;">pending review</strong> by our team.
              </p>

              <!-- Reference Card -->
              <div class="payment-box" style="background-color: #1a1a1a; border: 1px dashed #3a3a3a; border-radius: 8px; padding: 14px; text-align: center; margin-bottom: 24px;">
                <p style="margin: 0 0 4px; font-size: 10px; letter-spacing: 0.15em; color: #a1a1aa; font-weight: 700; text-transform: uppercase;">Reservation Reference</p>
                <p style="margin: 0; font-size: 18px; font-weight: 700; color: #ffffff; font-family: monospace; letter-spacing: 0.08em;">${reservation.id}</p>
              </div>

              ${renderBookingSummaryBox(reservation)}

              <!-- Timeline Steps -->
              <div class="payment-box" style="background-color: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 8px; padding: 18px; margin-bottom: 24px;">
                <p style="margin: 0 0 14px; font-size: 10px; letter-spacing: 0.15em; color: #a1a1aa; font-weight: 700; text-transform: uppercase;">What Happens Next</p>
                <table width="100%" cellpadding="0" cellspacing="0" style="width: 100%;">
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #2a2a2a; vertical-align: top; width: 32px;">
                      <span style="font-size: 16px;">🔍</span>
                    </td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #2a2a2a;">
                      <p style="margin: 0; font-size: 13px; font-weight: 700; color: #ffffff;">Step 1 — Review</p>
                      <p style="margin: 2px 0 0; font-size: 12px; color: #a1a1aa; line-height: 1.5;">Our team reviews your booking details within 24 hours.</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #2a2a2a; vertical-align: top; width: 32px;">
                      <span style="font-size: 16px;">✅</span>
                    </td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #2a2a2a;">
                      <p style="margin: 0; font-size: 13px; font-weight: 700; color: #ffffff;">Step 2 — Approval Email</p>
                      <p style="margin: 2px 0 0; font-size: 12px; color: #a1a1aa; line-height: 1.5;">Once approved, you'll receive an email with downpayment instructions (${amount} required).</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; vertical-align: top; width: 32px;">
                      <span style="font-size: 16px;">💳</span>
                    </td>
                    <td style="padding: 10px 0;">
                      <p style="margin: 0; font-size: 13px; font-weight: 700; color: #ffffff;">Step 3 — Downpayment</p>
                      <p style="margin: 2px 0 0; font-size: 12px; color: #a1a1aa; line-height: 1.5;">Submit your downpayment via GCash or Bank Transfer to fully secure your slot. Total: ${totalLabel}.</p>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" border="0" class="cta-table" style="margin-bottom: 20px; width: 100%;">
                <tr>
                  <td align="center" class="cta-cell" style="border-radius: 6px; background-color: #ffffff;">
                    <a href="${reservationLink}" target="_blank" class="cta-btn" style="font-size: 15px; font-weight: 700; color: #000000; text-decoration: none; padding: 14px 24px; display: inline-block; border-radius: 6px; font-family: sans-serif; letter-spacing: 0.01em; box-sizing: border-box;">
                      View My Reservation &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 12px; color: #71717a; word-break: break-word;">
                Or copy this link to your browser:<br/>
                <a href="${reservationLink}" style="color: #a1a1aa; text-decoration: underline; word-break: break-all;">${reservationLink}</a>
              </p>
            </td>
          </tr>

          ${renderCommonFooter()}

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// 1. APPROVED EMAIL TEMPLATE
export function getApprovedEmailHtml({
  reservation,
  amount,
  balance,
  totalLabel,
  reservationLink,
  isPreview = false,
}: {
  reservation: ReservationInfo;
  amount: string;
  balance: string;
  totalLabel: string;
  reservationLink: string;
  isPreview?: boolean;
}) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Reservation Approved — Antonioni Grounds</title>
  ${renderResponsiveStyles()}
</head>
<body style="margin: 0; padding: 0; background-color: #0d0d0d; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" class="outer-table" style="background-color: #0d0d0d; padding: 32px 12px; width: 100%;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" class="main-card" style="background-color: #141414; border-radius: 12px; overflow: hidden; border: 1px solid #262626; max-width: 600px; width: 100%;">
          
          ${renderCommonHeader(isPreview)}

          <!-- Content Section -->
          <tr>
            <td class="content-padding" style="padding: 36px 28px 40px;">
              <h1 class="email-heading" style="margin: 0 0 14px; font-size: 28px; font-weight: 900; line-height: 1.15; letter-spacing: -0.01em; color: #ffffff; text-transform: uppercase; font-family: 'Helvetica Neue', Arial, sans-serif;">
                RESERVATION APPROVED &#10003;
              </h1>

              <p class="email-subtext" style="margin: 0 0 20px; font-size: 15px; line-height: 1.6; color: #d4d4d8;">
                Your experience has been confirmed. Please complete your downpayment to secure your slot.
              </p>

              ${renderBookingSummaryBox(reservation)}

              <!-- Payment Box -->
              <div class="payment-box" style="background-color: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 8px; padding: 18px; margin-bottom: 24px;">
                <p style="margin: 0 0 12px; font-size: 10px; letter-spacing: 0.15em; color: #a1a1aa; font-weight: 700; text-transform: uppercase;">Downpayment Details</p>
                <table width="100%" cellpadding="0" cellspacing="0" style="width: 100%;">
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #2a2a2a;">
                      <span style="font-size: 13px; color: #a1a1aa;">Required Downpayment</span>
                    </td>
                    <td style="text-align: right; padding: 8px 0; border-bottom: 1px solid #2a2a2a;">
                      <span style="font-size: 17px; font-weight: 700; color: #ffffff;">${amount}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #2a2a2a;">
                      <span style="font-size: 13px; color: #a1a1aa;">Remaining Balance</span>
                    </td>
                    <td style="text-align: right; padding: 8px 0; border-bottom: 1px solid #2a2a2a;">
                      <span style="font-size: 14px; font-weight: 600; color: #d4d4d8;">${balance}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <span style="font-size: 13px; color: #a1a1aa;">Total Package Price</span>
                    </td>
                    <td style="text-align: right; padding: 8px 0;">
                      <span style="font-size: 13px; color: #a1a1aa; font-weight: 600;">${totalLabel}</span>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" border="0" class="cta-table" style="margin-bottom: 20px; width: 100%;">
                <tr>
                  <td align="center" class="cta-cell" style="border-radius: 6px; background-color: #ffffff;">
                    <a href="${reservationLink}" target="_blank" class="cta-btn" style="font-size: 15px; font-weight: 700; color: #000000; text-decoration: none; padding: 14px 24px; display: inline-block; border-radius: 6px; font-family: sans-serif; letter-spacing: 0.01em; box-sizing: border-border;">
                      View Reservation &amp; Pay Downpayment &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 12px; color: #71717a; word-break: break-word;">
                Or copy this link to your browser:<br/>
                <a href="${reservationLink}" style="color: #a1a1aa; text-decoration: underline; word-break: break-all;">${reservationLink}</a>
              </p>
            </td>
          </tr>

          ${renderCommonFooter()}

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// 2. SECURED EMAIL TEMPLATE
export function getSecuredEmailHtml({
  reservation,
  reservationLink,
  isPreview = false,
}: {
  reservation: ReservationInfo;
  reservationLink: string;
  isPreview?: boolean;
}) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Booking Secured — Antonioni Grounds</title>
  ${renderResponsiveStyles()}
</head>
<body style="margin: 0; padding: 0; background-color: #0d0d0d; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" class="outer-table" style="background-color: #0d0d0d; padding: 32px 12px; width: 100%;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" class="main-card" style="background-color: #141414; border-radius: 12px; overflow: hidden; border: 1px solid #262626; max-width: 600px; width: 100%;">
          
          ${renderCommonHeader(isPreview)}

          <!-- Content Section -->
          <tr>
            <td class="content-padding" style="padding: 36px 28px 40px;">
              <h1 class="email-heading" style="margin: 0 0 14px; font-size: 28px; font-weight: 900; line-height: 1.15; letter-spacing: -0.01em; color: #ffffff; text-transform: uppercase; font-family: 'Helvetica Neue', Arial, sans-serif;">
                BOOKING SECURED &#10003;
              </h1>

              <p class="email-subtext" style="margin: 0 0 20px; font-size: 15px; line-height: 1.6; color: #d4d4d8;">
                Your payment has been verified. Your reservation at Antonioni Grounds is now fully secured on our calendar.
              </p>

              ${renderBookingSummaryBox(reservation)}

              <!-- Status Box -->
              <div class="payment-box" style="background-color: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 8px; padding: 18px; text-align: center; margin-bottom: 24px;">
                <p style="margin: 0 0 4px; font-size: 10px; letter-spacing: 0.15em; color: #a1a1aa; font-weight: 700; text-transform: uppercase;">Payment Status</p>
                <p style="margin: 0; font-size: 17px; font-weight: 700; color: #ffffff;">Approved &amp; Paid &#10003;</p>
              </div>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" border="0" class="cta-table" style="margin-bottom: 20px; width: 100%;">
                <tr>
                  <td align="center" class="cta-cell" style="border-radius: 6px; background-color: #ffffff;">
                    <a href="${reservationLink}" target="_blank" class="cta-btn" style="font-size: 15px; font-weight: 700; color: #000000; text-decoration: none; padding: 14px 24px; display: inline-block; border-radius: 6px; font-family: sans-serif; letter-spacing: 0.01em; box-sizing: border-box;">
                      View Reservation Docket &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 12px; color: #71717a; word-break: break-word;">
                Or copy this link to your browser:<br/>
                <a href="${reservationLink}" style="color: #a1a1aa; text-decoration: underline; word-break: break-all;">${reservationLink}</a>
              </p>
            </td>
          </tr>

          ${renderCommonFooter()}

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// 3. COMPLETED EMAIL TEMPLATE
export function getCompletedEmailHtml({
  reservation,
  reservationLink,
  isPreview = false,
}: {
  reservation: ReservationInfo;
  reservationLink: string;
  isPreview?: boolean;
}) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Thank You — Antonioni Grounds</title>
  ${renderResponsiveStyles()}
</head>
<body style="margin: 0; padding: 0; background-color: #0d0d0d; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" class="outer-table" style="background-color: #0d0d0d; padding: 32px 12px; width: 100%;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" class="main-card" style="background-color: #141414; border-radius: 12px; overflow: hidden; border: 1px solid #262626; max-width: 600px; width: 100%;">
          
          ${renderCommonHeader(isPreview)}

          <!-- Content Section -->
          <tr>
            <td class="content-padding" style="padding: 36px 28px 40px;">
              <h1 class="email-heading" style="margin: 0 0 14px; font-size: 28px; font-weight: 900; line-height: 1.15; letter-spacing: -0.01em; color: #ffffff; text-transform: uppercase; font-family: 'Helvetica Neue', Arial, sans-serif;">
                THANK YOU, ${reservation.fullName.toUpperCase()}!
              </h1>

              <p class="email-subtext" style="margin: 0 0 20px; font-size: 15px; line-height: 1.6; color: #d4d4d8;">
                Your reservation experience at Antonioni Grounds has been completed. We hope it was an unforgettable moment.
              </p>

              ${renderBookingSummaryBox(reservation)}

              <!-- Thank You Box -->
              <div class="payment-box" style="background-color: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 24px;">
                <p style="margin: 0 0 6px; font-size: 22px;">&#127775;</p>
                <p style="margin: 0; font-size: 15px; color: #ffffff; line-height: 1.6; font-weight: 600;">
                  It was a pleasure hosting you at Antonioni Grounds.
                </p>
                <p style="margin: 6px 0 0; font-size: 13px; color: #a1a1aa; line-height: 1.6;">
                  We are committed to crafting exceptional coffee experiences, and we hope you felt that with every sip.
                </p>
              </div>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" border="0" class="cta-table" style="margin-bottom: 20px; width: 100%;">
                <tr>
                  <td align="center" class="cta-cell" style="border-radius: 6px; background-color: #ffffff;">
                    <a href="${reservationLink}" target="_blank" class="cta-btn" style="font-size: 15px; font-weight: 700; color: #000000; text-decoration: none; padding: 14px 24px; display: inline-block; border-radius: 6px; font-family: sans-serif; letter-spacing: 0.01em; box-sizing: border-box;">
                      View Completed Booking &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${renderCommonFooter()}

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

