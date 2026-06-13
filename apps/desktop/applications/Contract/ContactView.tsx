import { WindowProps } from "@/components/WindowManagement/WindowCompositor";
import { useTranslation } from "react-i18next";
import styles from './ContactView.module.css';
import { FormEvent, useEffect, useRef, useState } from "react";
import { isEmail, isEmpty } from "@/components/util";

type ValidationError = (
  'empty-name' |
  'empty-email' |
  'empty-message' |
  'invalid-email'
);

function DutchContent() {
  return (
    <>
      <p className={styles['contact-info']}>
        Gebruik dit formulier om feedback, bug reports of verzoeken voor de OSDC hub door te geven. Deze clone gebruikt een geconfigureerde inbox in plaats van persoonlijke contactgegevens.
      </p>
    </>
  );
}

function EnglishContent() {
  return (
    <>
      <p className={styles['contact-info']}>
        Use this form to send feedback, bug reports, or requests for the OSDC hub. This clone routes messages to a configured inbox instead of personal contact details.
      </p>
    </>
  );
}

export default function ContactApplicationView(props: WindowProps) {
  const nameRef = useRef<HTMLInputElement>(null);

  const { t, i18n } = useTranslation('common');

  const [inputFields, setInputFields] = useState({
    name: "",
    email: "",
    company: "",
    message: ""
  });

  const [errors, setErrors] = useState<Set<ValidationError>>(new Set());

  const [loading, setLoading] = useState(false);
  const [processed, setProcessed] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setInputFields({ ...inputFields, [e.target.name]: e.target.value });
    setErrors(new Set());
  }

  function resetInput() {
    setInputFields({
      name: "",
      email: "",
      company: "",
      message: ""
    });
  }

  async function sendEmail() {
    const response = await fetch("/api/contact", {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(inputFields),
    });

    setLoading(false);

    if (response.ok) {
      setProcessed(true);
    }
  }

  function validateForm(): ValidationError[] {
    const formErrors: ValidationError[] = [];

    if (isEmpty(inputFields.name)) { formErrors.push('empty-name'); }
    if (isEmpty(inputFields.email)) { formErrors.push('empty-email'); }
    if (isEmpty(inputFields.message)) { formErrors.push('empty-message'); }

    if (!isEmail(inputFields.email)) { formErrors.push('invalid-email'); }

    return formErrors;
  }

  function isFormValid(): boolean {
    return validateForm().length === 0;
  }

  function handleFormErrors() {
    setErrors(new Set(validateForm()));
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();

    setLoading(true);
    setProcessed(false);

    if (isFormValid()) {
      sendEmail().then(() => resetInput());
    } else {
      setLoading(false);
      handleFormErrors();
    }
  }

  useEffect(() => {
    if (!nameRef.current) { return; }

    nameRef.current.focus();
  }, []);

  return (
    <div className="content-outer">
      <div className="content">
        <div className={styles['center']}>
          <div className={styles['center-content']}>
            <div className={styles['contact-header']}>
              <h1>Contact</h1>
            </div>
            { i18n.language === 'nl' ? DutchContent() : EnglishContent() }
            <form onSubmit={onSubmit}>
              { processed ?
                <div className={[styles['form-row'], styles['processed']].join(' ')}>
                  <span>{t("contact.processed")}</span>
                </div> : <></>
              }

              <div className={styles['form-row']}>
                <label htmlFor="name"><span className={styles.required}>*</span>{t("contact.name")}:</label>
                <input
                  className="system-text-input"
                  ref={nameRef}
                  id="name"
                  type="text"
                  name="name"
                  disabled={loading}
                  placeholder={t("contact.name")}
                  value={inputFields.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles['form-row']}>
                <label htmlFor="email"><span className={styles.required}>*</span>{t("contact.email")}:</label>
                <input
                  className="system-text-input"
                  id="email"
                  type="email"
                  name="email"
                  disabled={loading}
                  placeholder={t("contact.email")}
                  value={inputFields.email}
                  onChange={handleChange}
                />
                { errors.has('invalid-email') ? <span>{t('contact.error.invalid-email')}</span> : <></> }
              </div>

              <div className={styles['form-row']}>
                <label htmlFor="company">{t("contact.company_optional")}:</label>
                <input
                  className="system-text-input"
                  id="company"
                  type="text"
                  name="company"
                  disabled={loading}
                  placeholder={t("contact.company")}
                  value={inputFields.company}
                  onChange={handleChange}
                />
              </div>

              <div className={styles['form-row']}>
                <label htmlFor="message"><span className={styles.required}>*</span>{t("contact.message")}:</label>
                <textarea
                  className="system-text-input"
                  id="message"
                  name="message"
                  disabled={loading}
                  placeholder={t("contact.message")}
                  value={inputFields.message}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles['form-row']}>
                <input type="submit" className="system-button" disabled={!isFormValid() || loading} value={t("contact.send")}/>

                <div className={styles['instructions']}>
                  <span>{t("contact.message_forwarding_instructions")}</span>
                  <span className={styles['required-instructions']}><span className={styles.required}>*</span> = {t("contact.required")}</span>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
