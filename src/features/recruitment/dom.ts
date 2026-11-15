/** Accès aux éléments de la page de recrutement (identifiants définis dans src/pages/recrutement.html). */

function byId<T extends HTMLElement>(id: string, type: { new (): T }): T {
  const el = document.getElementById(id);
  if (!(el instanceof type)) throw new Error(`recrutement : élément #${id} introuvable`);
  return el;
}

export interface RecruitmentDom {
  form: HTMLFormElement;
  submit: HTMLButtonElement;
  error: HTMLElement;
  recap: HTMLElement;
  recapIntro: HTMLElement;
  sendStatus: HTMLElement;
  summary: HTMLElement;
  copy: HTMLButtonElement;
  popup: HTMLDialogElement;
  popupConfirm: HTMLButtonElement;
  popupCancel: HTMLButtonElement;
}

export function getRecruitmentDom(): RecruitmentDom {
  const form = byId('candidature', HTMLFormElement);
  const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  if (!submit) throw new Error('recrutement : bouton d’envoi introuvable');
  return {
    form,
    submit,
    error: byId('erreur', HTMLElement),
    recap: byId('recap', HTMLElement),
    recapIntro: byId('intro-recap', HTMLElement),
    sendStatus: byId('statut-envoi', HTMLElement),
    summary: byId('texte-recap', HTMLElement),
    copy: byId('copier', HTMLButtonElement),
    popup: byId('popup-candidature', HTMLDialogElement),
    popupConfirm: byId('popup-ok', HTMLButtonElement),
    popupCancel: byId('popup-annuler', HTMLButtonElement),
  };
}
