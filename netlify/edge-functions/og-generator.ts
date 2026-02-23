import { Context } from '@netlify/edge-functions';

export default async (request: Request, context: Context) => {
  const url = new URL(request.url);
  const slug = url.pathname.split('/').filter(Boolean)[0];

  // Ignorer les fichiers statiques et les routes internes
  if (!slug || slug.includes('.') || ['login', 'studio', 'arena', 'admin', 'wizard', 'terms', 'register'].includes(slug)) {
    return context.next();
  }

  // Récupérer le HTML de base
  const response = await context.next();
  let html = await response.text();

  try {
    // Requête rapide à Firebase REST API pour récupérer le prestataire
    const queryPayload = {
      structuredQuery: {
        from: [{ collectionId: 'users' }],
        where: {
          fieldFilter: {
            field: { fieldPath: 'portfolioSlug' },
            op: 'EQUAL',
            value: { stringValue: slug }
          }
        },
        limit: 1
      }
    };

    const dbRes = await fetch('https://firestore.googleapis.com/v1/projects/myfolio-tag/databases/(default)/documents:runQuery', {
      method: 'POST',
      body: JSON.stringify(queryPayload)
    });

    const dbData = await dbRes.json();

    // Si on trouve le prestataire, on remplace les balises META
    if (dbData && dbData[0] && dbData[0].document) {
      const userFields = dbData[0].document.fields;
      const name = userFields.name?.stringValue || 'Prestataire';
      const bio = userFields.bio?.stringValue || 'Découvrez mon Empire numérique sur MyFolio.';
      const image = userFields.profileImage?.stringValue || 'https://myfoliotag.com/preview-empire.png';

      // Remplacement chirurgical dans le HTML
      html = html.replace(/<title>.*<\/title>/, `<title>${name} | Portfolio Exclusif</title>`);
      html = html.replace(/content="MyFolio \| Ton Empire Digital"/g, `content="${name} | Portfolio Exclusif"`);
      html = html.replace(/content="Rejoignez l'élite\. Créez votre vitrine professionnelle en 60 secondes avec l'IA\."/g, `content="${bio}"`);
      html = html.replace(/content="https:\/\/myfoliotag\.com\/preview-empire\.png"/g, `content="${image}"`);
    }
  } catch (error) {
    console.log("Erreur Edge Function (OG Tags):", error);
  }

  return new Response(html, {
    headers: { 'content-type': 'text/html' },
  });
};
