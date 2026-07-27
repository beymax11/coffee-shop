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

function renderCommonHeader(isPreview = false) {
  const logoSrc = isPreview ? "/logo.png" : "cid:logo";
  const heroSrc = isPreview ? "/hero.png" : "cid:hero";
  return `
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
  `;
}

function renderCommonFooter() {
  return `
          <!-- Footer Section -->
          <tr>
            <td style="padding: 40px 32px; border-top: 1px solid #262626; background-color: #0a0a0a;">
              <p style="margin: 0 0 24px; font-size: 13px; line-height: 1.6; color: #a1a1aa; max-width: 420px;">
                ${companyName} brings you handcrafted specialty coffee, artisanal pastries, and unforgettable moments in Tiaong, Quezon.
              </p>
              
              <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="padding-right: 20px;">
                    <a href="${fbUrl}" target="_blank" style="color: #ffffff; font-size: 12px; text-decoration: none; font-weight: 600;">Facebook</a>
                  </td>
                  <td style="padding-right: 20px;">
                    <a href="${igUrl}" target="_blank" style="color: #ffffff; font-size: 12px; text-decoration: none; font-weight: 600;">Instagram</a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 16px; font-size: 11px; line-height: 1.5; color: #71717a;">
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
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 8px; margin-bottom: 28px; overflow: hidden;">
                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #2a2a2a;">
                    <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; color: #a1a1aa; font-weight: 700;">Guest Name</span><br/>
                    <span style="font-size: 14px; font-weight: 600; color: #ffffff; margin-top: 2px; display: inline-block;">${reservation.fullName}</span>
                  </td>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #2a2a2a; text-align: right;">
                    <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; color: #a1a1aa; font-weight: 700;">Experience</span><br/>
                    <span style="font-size: 14px; font-weight: 600; color: #ffffff; margin-top: 2px; display: inline-block;">${reservation.eventType}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #2a2a2a;">
                    <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; color: #a1a1aa; font-weight: 700;">Date</span><br/>
                    <span style="font-size: 14px; font-weight: 600; color: #ffffff; margin-top: 2px; display: inline-block;">${reservation.date}</span>
                  </td>
                  <td style="padding: 14px 18px; border-bottom: 1px solid #2a2a2a; text-align: right;">
                    <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; color: #a1a1aa; font-weight: 700;">Time</span><br/>
                    <span style="font-size: 14px; font-weight: 600; color: #ffffff; font-family: monospace; margin-top: 2px; display: inline-block;">${reservation.time}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 14px 18px;">
                    <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; color: #a1a1aa; font-weight: 700;">Guests</span><br/>
                    <span style="font-size: 14px; font-weight: 600; color: #ffffff; margin-top: 2px; display: inline-block;">${reservation.guestCount} guest${reservation.guestCount > 1 ? "s" : ""}</span>
                  </td>
                  <td style="padding: 14px 18px; text-align: right;">
                    <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; color: #a1a1aa; font-weight: 700;">Location</span><br/>
                    <span style="font-size: 14px; font-weight: 600; color: #ffffff; margin-top: 2px; display: inline-block;">${reservation.location}</span>
                  </td>
                </tr>
              </table>
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
</head>
<body style="margin: 0; padding: 0; background-color: #0d0d0d; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0d0d0d; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="640" cellpadding="0" cellspacing="0" style="background-color: #141414; border-radius: 12px; overflow: hidden; border: 1px solid #262626; max-width: 100%;">
          
          ${renderCommonHeader(isPreview)}

          <!-- Content Section -->
          <tr>
            <td style="padding: 40px 32px 48px;">
              <h1 style="margin: 0 0 16px; font-size: 42px; font-weight: 900; line-height: 1.05; letter-spacing: -0.02em; color: #ffffff; text-transform: uppercase; font-family: 'Helvetica Neue', Arial, sans-serif;">
                RESERVATION APPROVED &#10003;
              </h1>

              <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #d4d4d8;">
                Your experience has been confirmed. Please complete your downpayment to secure your slot.
              </p>

              ${renderBookingSummaryBox(reservation)}

              <!-- Payment Box -->
              <div style="background-color: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 8px; padding: 20px; margin-bottom: 28px;">
                <p style="margin: 0 0 12px; font-size: 10px; letter-spacing: 0.15em; color: #a1a1aa; font-weight: 700; text-transform: uppercase;">Downpayment Details</p>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #2a2a2a;">
                      <span style="font-size: 13px; color: #a1a1aa;">Required Downpayment</span>
                    </td>
                    <td style="text-align: right; padding: 8px 0; border-bottom: 1px solid #2a2a2a;">
                      <span style="font-size: 18px; font-weight: 700; color: #ffffff;">${amount}</span>
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
              <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
                <tr>
                  <td align="center" style="border-radius: 4px; background-color: #ffffff;">
                    <a href="${reservationLink}" target="_blank" style="font-size: 15px; font-weight: 700; color: #000000; text-decoration: none; padding: 14px 28px; display: inline-block; border-radius: 4px; font-family: sans-serif; letter-spacing: 0.01em;">
                      View Reservation &amp; Pay Downpayment &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 12px; color: #71717a;">
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
</head>
<body style="margin: 0; padding: 0; background-color: #0d0d0d; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0d0d0d; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="640" cellpadding="0" cellspacing="0" style="background-color: #141414; border-radius: 12px; overflow: hidden; border: 1px solid #262626; max-width: 100%;">
          
          ${renderCommonHeader(isPreview)}

          <!-- Content Section -->
          <tr>
            <td style="padding: 40px 32px 48px;">
              <h1 style="margin: 0 0 16px; font-size: 42px; font-weight: 900; line-height: 1.05; letter-spacing: -0.02em; color: #ffffff; text-transform: uppercase; font-family: 'Helvetica Neue', Arial, sans-serif;">
                BOOKING SECURED &#10003;
              </h1>

              <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #d4d4d8;">
                Your payment has been verified. Your reservation at Antonioni Grounds is now fully secured on our calendar.
              </p>

              ${renderBookingSummaryBox(reservation)}

              <!-- Status Box -->
              <div style="background-color: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 28px;">
                <p style="margin: 0 0 4px; font-size: 10px; letter-spacing: 0.15em; color: #a1a1aa; font-weight: 700; text-transform: uppercase;">Payment Status</p>
                <p style="margin: 0; font-size: 18px; font-weight: 700; color: #ffffff;">Approved &amp; Paid &#10003;</p>
              </div>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
                <tr>
                  <td align="center" style="border-radius: 4px; background-color: #ffffff;">
                    <a href="${reservationLink}" target="_blank" style="font-size: 15px; font-weight: 700; color: #000000; text-decoration: none; padding: 14px 28px; display: inline-block; border-radius: 4px; font-family: sans-serif; letter-spacing: 0.01em;">
                      View Reservation Docket &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 12px; color: #71717a;">
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
</head>
<body style="margin: 0; padding: 0; background-color: #0d0d0d; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0d0d0d; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="640" cellpadding="0" cellspacing="0" style="background-color: #141414; border-radius: 12px; overflow: hidden; border: 1px solid #262626; max-width: 100%;">
          
          ${renderCommonHeader(isPreview)}

          <!-- Content Section -->
          <tr>
            <td style="padding: 40px 32px 48px;">
              <h1 style="margin: 0 0 16px; font-size: 42px; font-weight: 900; line-height: 1.05; letter-spacing: -0.02em; color: #ffffff; text-transform: uppercase; font-family: 'Helvetica Neue', Arial, sans-serif;">
                THANK YOU, ${reservation.fullName.toUpperCase()}!
              </h1>

              <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #d4d4d8;">
                Your reservation experience at Antonioni Grounds has been completed. We hope it was an unforgettable moment.
              </p>

              ${renderBookingSummaryBox(reservation)}

              <!-- Thank You Box -->
              <div style="background-color: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 28px;">
                <p style="margin: 0 0 8px; font-size: 24px;">&#127775;</p>
                <p style="margin: 0; font-size: 15px; color: #ffffff; line-height: 1.6; font-weight: 600;">
                  It was a pleasure hosting you at Antonioni Grounds.
                </p>
                <p style="margin: 8px 0 0; font-size: 13px; color: #a1a1aa; line-height: 1.6;">
                  We are committed to crafting exceptional coffee experiences, and we hope you felt that with every sip.
                </p>
              </div>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
                <tr>
                  <td align="center" style="border-radius: 4px; background-color: #ffffff;">
                    <a href="${reservationLink}" target="_blank" style="font-size: 15px; font-weight: 700; color: #000000; text-decoration: none; padding: 14px 28px; display: inline-block; border-radius: 4px; font-family: sans-serif; letter-spacing: 0.01em;">
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
