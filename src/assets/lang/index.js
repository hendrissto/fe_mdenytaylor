import { addLocaleData } from 'react-intl';
import enLang from './entries/en';
import idLang from './entries/id';
// below is original language from admin template, currently we not use these
// import esLang from './entries/es-ES';
// import enRtlLang from './entries/en-US-rtl';

const AppLocale = {
    id: idLang,
    en: enLang,
    // es: esLang
    // enrtl:enRtlLang
};
addLocaleData(AppLocale.id.data);
addLocaleData(AppLocale.en.data);
// below is original language from admin template, currently we not use these
// addLocaleData(AppLocale.es.data);
// addLocaleData(AppLocale.enrtl.data);

export default AppLocale;
