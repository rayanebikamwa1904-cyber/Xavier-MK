import React from 'react';

const ActionBlock = ({ creatorData, styles, theme }: any) => {
  if (!creatorData || (!creatorData.googleFormUrl && (!creatorData.customButtons || creatorData.customButtons.length === 0))) {
    return null;
  }

  return (
    <section id="action-royale" className={`py-32 ${styles.cardBg} border-t ${styles.borderColor}`}>
      <div className="max-w-4xl mx-auto text-center">
        <h2 className={`text-4xl md:text-6xl font-bold ${styles.text} ${styles.font} mb-12`}>{creatorData.labels?.action || 'Action Royale'}</h2>

        {creatorData.googleFormUrl ? (
          <div className="aspect-w-16 aspect-h-9 max-w-3xl mx-auto">
            <iframe src={creatorData.googleFormUrl} width="100%" height="800" frameBorder="0" marginHeight={0} marginWidth={0}>Chargement…</iframe>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            {creatorData.customButtons.map((button, index) => (
              <a 
                key={index}
                href={button.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className={`w-full max-w-md px-8 py-4 ${styles.buttonBg} ${styles.buttonText} font-bold uppercase tracking-widest transition duration-300 flex items-center justify-center gap-2 rounded-lg`}
              >
                {button.title}
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ActionBlock;
