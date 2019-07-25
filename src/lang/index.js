import { addLocaleData } from 'react-intl';
import enLang from './entries/en';
import idLang from './entries/id';
import esLang from './entries/es-ES';
// import enRtlLang from './entries/en-US-rtl';

const AppLocale = {
    id: idLang,
    en: enLang,
    es: esLang
    // enrtl:enRtlLang
};
addLocaleData(AppLocale.id.data);
addLocaleData(AppLocale.en.data);
addLocaleData(AppLocale.es.data);
// addLocaleData(AppLocale.enrtl.data);

export default AppLocale;
