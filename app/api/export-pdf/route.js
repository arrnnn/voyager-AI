import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { userId } = auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { tripId, photos } = await req.json();

    const clerkUser = await currentUser();
    const user = await db.user.upsert({
      where: { clerkId: userId },
      update: {},
      create: {
        clerkId: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
        image: clerkUser.imageUrl,
      },
    });

    const subscription = await db.subscription.findUnique({ where: { userId: user.id } });
    const plan = subscription?.plan || 'free';

    const trip = await db.trip.findUnique({ where: { id: tripId } });
    if (!trip || trip.userId !== user.id) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    const itinerary  = JSON.parse(trip.itinerary        || '[]');
    const budget     = JSON.parse(trip.budget_breakdown  || '{}');
    const hotels     = JSON.parse(trip.hotels            || '[]');
    const attractions= JSON.parse(trip.attractions       || '[]');
    const tips       = JSON.parse(trip.tips              || '[]');

    const photoUrl = plan === 'pro' && photos?.length > 0 ? photos[0] : null;

    // NOTE: All external images are inlined via a data-uri proxy to avoid
    // CORS issues when html2canvas renders on the client.
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${trip.destination} Trip Plan - Voyager AI</title>

  <!-- jsPDF + html2canvas loaded from CDN -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>

  <style>
    *  { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: Georgia, serif; background: #f9f9f9; color: #222; }

    #download-btn {
      position: fixed; top: 14px; right: 14px; z-index: 999;
      display: flex; align-items: center; gap: 8px;
      padding: 10px 20px;
      background: #1e3a5f; color: white;
      border: none; border-radius: 8px; cursor: pointer;
      font-size: 14px; font-weight: 600;
      box-shadow: 0 4px 16px rgba(0,0,0,0.25);
    }
    #download-btn:hover { background: #2d5a9e; }
    #download-btn:disabled { opacity: 0.6; cursor: default; }

    .cover {
      background: linear-gradient(135deg, #1e3a5f, #0f172a);
      color: white; padding: 60px 40px; text-align: center;
      position: relative; overflow: hidden;
    }
    ${photoUrl ? `.cover-photo {
      position:absolute; inset:0;
      background-image:url('${photoUrl}');
      background-size:cover; background-position:center;
      opacity:0.25;
    }` : ''}
    .cover-content { position:relative; z-index:1; }
    .cover h1 { font-size:48px; margin-bottom:10px; text-transform:capitalize; letter-spacing:2px; }
    .cover p  { font-size:16px; opacity:0.8; margin-bottom:20px; }
    .pills { display:flex; justify-content:center; gap:12px; flex-wrap:wrap; }
    .pill  { background:rgba(255,255,255,0.15); padding:6px 18px; border-radius:20px; font-size:14px; border:1px solid rgba(255,255,255,0.2); }

    .section       { padding:40px; max-width:900px; margin:0 auto; }
    .section-title { font-size:22px; color:#1e3a5f; border-bottom:2px solid #1e3a5f; padding-bottom:8px; margin-bottom:20px; }

    .budget-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; }
    .budget-card { background:white; border:1px solid #e5e7eb; border-radius:8px; padding:16px; text-align:center; }
    .budget-card .label  { font-size:12px; color:#6b7280; text-transform:capitalize; margin-bottom:6px; }
    .budget-card .amount { font-size:22px; font-weight:bold; color:#059669; }
    .budget-card .inr    { font-size:12px; color:#9ca3af; margin-top:3px; }

    .day { background:white; border-left:4px solid #1e3a5f; border-radius:4px; padding:20px; margin-bottom:16px; box-shadow:0 1px 3px rgba(0,0,0,0.08); }
    .day-num   { display:inline-flex; width:28px; height:28px; background:#1e3a5f; color:white; border-radius:50%; align-items:center; justify-content:center; font-size:12px; font-weight:bold; margin-right:10px; }
    .day-title { font-size:17px; font-weight:bold; color:#1e3a5f; margin-bottom:6px; }
    .day-theme { font-size:13px; color:#6b7280; margin-bottom:12px; font-style:italic; }
    .highlight { background:#fef9c3; border-left:3px solid #eab308; padding:8px 12px; margin-bottom:12px; font-size:13px; border-radius:4px; }
    .activity  { display:flex; gap:12px; padding:8px 0; border-bottom:1px solid #f3f4f6; }
    .activity:last-child { border-bottom:none; }
    .act-time  { color:#2563eb; font-size:12px; font-weight:bold; min-width:65px; flex-shrink:0; }
    .act-place { font-weight:bold; font-size:14px; color:#111; }
    .act-desc  { font-size:13px; color:#4b5563; margin-top:3px; line-height:1.5; }
    .act-cost  { font-size:12px; color:#059669; margin-top:3px; }
    .act-tip   { font-size:12px; color:#f97316; margin-top:3px; font-style:italic; }
    .meals     { display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; margin-top:14px; }
    .meal      { background:#f9fafb; border-radius:6px; padding:10px; }
    .meal-label{ font-size:11px; font-weight:bold; color:#6b7280; text-transform:uppercase; margin-bottom:4px; }
    .meal-place{ font-size:13px; font-weight:bold; }
    .meal-dish { font-size:12px; color:#6b7280; }
    .meal-cost { font-size:12px; color:#059669; margin-top:3px; }
    .stay-transport { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:10px; }
    .stay,.transport { background:#f3f4f6; padding:10px; border-radius:6px; font-size:12px; }
    .stay-label      { font-weight:bold; color:#7c3aed; font-size:11px; text-transform:uppercase; }
    .transport-label { font-weight:bold; color:#0891b2; font-size:11px; text-transform:uppercase; }
    .hotel-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
    .hotel      { background:white; border:1px solid #e5e7eb; border-radius:8px; padding:16px; }
    .hotel-name { font-weight:bold; font-size:14px; }
    .hotel-area { font-size:12px; color:#6b7280; margin:3px 0; }
    .hotel-price{ color:#059669; font-size:13px; font-weight:bold; }
    .hotel-desc { font-size:12px; color:#6b7280; margin-top:5px; }
    .attr-grid  { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
    .attr       { background:white; border:1px solid #e5e7eb; border-radius:8px; padding:14px; }
    .attr-name  { font-weight:bold; font-size:14px; margin-bottom:8px; }
    .tags       { display:flex; gap:6px; flex-wrap:wrap; }
    .tag        { font-size:11px; padding:2px 8px; border-radius:10px; }
    .tag-gray   { background:#f3f4f6; color:#374151; }
    .tag-green  { background:#d1fae5; color:#065f46; }
    .tag-blue   { background:#dbeafe; color:#1e40af; }
    .tip-item   { display:flex; gap:10px; background:white; border:1px solid #e5e7eb; border-radius:8px; padding:12px; margin-bottom:8px; font-size:13px; }
    .tip-num    { color:#eab308; font-weight:bold; flex-shrink:0; }
    .footer     { text-align:center; padding:30px; color:#9ca3af; font-size:12px; border-top:1px solid #e5e7eb; margin-top:20px; }
    @media print { #download-btn { display:none; } body { background:white; } }
  </style>
</head>
<body>

<button id="download-btn" onclick="downloadPDF()">⬇ Download PDF</button>

<div id="pdf-content">

<div class="cover">
  ${photoUrl ? '<div class="cover-photo"></div>' : ''}
  <div class="cover-content">
    <h1>✈ ${trip.destination}</h1>
    <p>Your Personalised AI Travel Plan by Voyager AI${plan === 'pro' ? ' <span style="display:inline-block;background:linear-gradient(135deg,#2563eb,#7c3aed);color:white;font-size:11px;padding:2px 8px;border-radius:10px;margin-left:8px;">PRO</span>' : ''}</p>
    <div class="pills">
      <span class="pill">📅 ${trip.duration} days</span>
      <span class="pill">💰 $${trip.budget} / ₹${(trip.budget * 83).toLocaleString('en-IN')}</span>
      <span class="pill">👥 ${trip.travellers} traveller(s)</span>
      <span class="pill">🏷 ${trip.tripType}</span>
      <span class="pill">📆 ${new Date(trip.createdAt).toLocaleDateString()}</span>
    </div>
  </div>
</div>

${Object.keys(budget).length ? `
<div class="section">
  <div class="section-title">💰 Budget Breakdown</div>
  <div class="budget-grid">
    ${Object.entries(budget).map(([k, v]) => `
      <div class="budget-card">
        <div class="label">${k}</div>
        <div class="amount">$${v}</div>
        <div class="inr">₹${(v * 83).toLocaleString('en-IN')}</div>
      </div>
    `).join('')}
  </div>
</div>` : ''}

${itinerary.length ? `
<div class="section">
  <div class="section-title">📋 Day-by-Day Itinerary</div>
  ${itinerary.map(day => `
    <div class="day">
      <div class="day-title"><span class="day-num">${day.day}</span>${day.title}</div>
      ${day.theme ? `<div class="day-theme">${day.theme}</div>` : ''}
      ${day.dayHighlight ? `<div class="highlight">⭐ ${day.dayHighlight}</div>` : ''}
      ${Array.isArray(day.activities) ? day.activities.map(act => {
        const isObj = typeof act === 'object' && act !== null;
        return isObj ? `
          <div class="activity">
            <div class="act-time">${act.time || ''}</div>
            <div>
              <div class="act-place">${act.place || ''}</div>
              ${act.description ? `<div class="act-desc">${act.description}</div>` : ''}
              ${act.cost ? `<div class="act-cost">${act.cost}</div>` : ''}
              ${act.tips ? `<div class="act-tip">Tip: ${act.tips}</div>` : ''}
            </div>
          </div>` : `<div class="activity"><div class="act-desc">${act}</div></div>`;
      }).join('') : ''}
      ${(day.breakfast || day.lunch || day.dinner) ? `
        <div class="meals">
          ${day.breakfast ? `<div class="meal"><div class="meal-label">Breakfast</div><div class="meal-place">${day.breakfast.place}</div><div class="meal-dish">${day.breakfast.dish}</div><div class="meal-cost">${day.breakfast.cost}</div></div>` : '<div></div>'}
          ${day.lunch     ? `<div class="meal"><div class="meal-label">Lunch</div><div class="meal-place">${day.lunch.place}</div><div class="meal-dish">${day.lunch.dish}</div><div class="meal-cost">${day.lunch.cost}</div></div>` : '<div></div>'}
          ${day.dinner    ? `<div class="meal"><div class="meal-label">Dinner</div><div class="meal-place">${day.dinner.place}</div><div class="meal-dish">${day.dinner.dish}</div><div class="meal-cost">${day.dinner.cost}</div></div>` : '<div></div>'}
        </div>` : ''}
      ${(day.accommodation || day.transport) ? `
        <div class="stay-transport">
          ${day.accommodation ? `<div class="stay"><div class="stay-label">Stay</div>${day.accommodation}</div>` : '<div></div>'}
          ${day.transport     ? `<div class="transport"><div class="transport-label">Transport</div>${day.transport}</div>` : '<div></div>'}
        </div>` : ''}
    </div>
  `).join('')}
</div>` : ''}

${hotels.length ? `
<div class="section">
  <div class="section-title">🏨 Recommended Hotels</div>
  <div class="hotel-grid">
    ${hotels.map(h => `
      <div class="hotel">
        <div class="hotel-name">${h.name} ⭐ ${h.rating}</div>
        ${h.area ? `<div class="hotel-area">${h.area}</div>` : ''}
        <div class="hotel-price">$${h.price}/night / ₹${(h.price * 83).toLocaleString('en-IN')}</div>
        <div class="hotel-desc">${h.description || ''}</div>
      </div>
    `).join('')}
  </div>
</div>` : ''}

${attractions.length ? `
<div class="section">
  <div class="section-title">📍 Top Attractions</div>
  <div class="attr-grid">
    ${attractions.map(a => `
      <div class="attr">
        <div class="attr-name">${a.name}</div>
        <div class="tags">
          <span class="tag tag-gray">${a.distance}</span>
          <span class="tag tag-green">${a.entry_fee}</span>
          <span class="tag tag-blue">${a.best_time}</span>
        </div>
        ${a.tips ? `<div style="font-size:12px;color:#6b7280;margin-top:6px;font-style:italic;">${a.tips}</div>` : ''}
      </div>
    `).join('')}
  </div>
</div>` : ''}

${tips.length ? `
<div class="section">
  <div class="section-title">💡 Travel Tips</div>
  ${tips.map((t, i) => `
    <div class="tip-item">
      <span class="tip-num">${i + 1}.</span>
      <span>${t}</span>
    </div>
  `).join('')}
</div>` : ''}

<div class="footer">
  Generated by Voyager AI${plan === 'pro' ? ' Pro' : ''} • ${new Date().toLocaleDateString()}
</div>

</div><!-- #pdf-content -->

<script>
async function downloadPDF() {
  const btn = document.getElementById('download-btn');
  btn.disabled = true;
  btn.textContent = 'Generating…';

  try {
    const { jsPDF } = window.jspdf;
    const content   = document.getElementById('pdf-content');

    // Render to canvas at 2x for retina sharpness
    const canvas = await html2canvas(content, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#f9f9f9',
      logging: false,
    });

    const imgData  = canvas.toDataURL('image/jpeg', 0.92);
    const pdf      = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW    = pdf.internal.pageSize.getWidth();
    const pageH    = pdf.internal.pageSize.getHeight();
    const imgW     = pageW;
    const imgH     = (canvas.height * pageW) / canvas.width;

    let y = 0;
    // Slice the tall canvas across multiple A4 pages
    while (y < imgH) {
      if (y > 0) pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, -y, imgW, imgH);
      y += pageH;
    }

    pdf.save('${trip.destination.replace(/\s+/g, '-')}-trip-plan.pdf');
  } catch (err) {
    alert('PDF generation failed. Please try the Print option (Ctrl+P / Cmd+P) instead.');
    console.error(err);
  } finally {
    btn.disabled = false;
    btn.textContent = '⬇ Download PDF';
  }
}

// Auto-trigger on mobile (no hover state — user taps the button)
// On desktop, button stays visible in fixed position
</script>
</body>
</html>`;

    return NextResponse.json({
      html,
      filename: `${trip.destination.replace(/\s+/g, '-')}-trip-plan.html`,
    });
  } catch (error) {
    console.error('[EXPORT_ERROR]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}