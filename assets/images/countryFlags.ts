// Country flags mapping using multiple CDN fallbacks for reliability
// Primary: flagcdn.com, Fallback: flagpedia.net, Final fallback: local assets

const CDN_PROVIDERS = [
  'https://flagcdn.com',
  'https://flagpedia.net',
  'https://restcountries.eu'
];

export const countryFlags: { [key: string]: string } = {
  // Major countries from the image
  'CL': 'https://flagcdn.com/w40/cl.png', // Chile
  'PE': 'https://flagcdn.com/w40/pe.png', // Peru
  'CO': 'https://flagcdn.com/w40/co.png', // Colombia
  'UY': 'https://flagcdn.com/w40/uy.png', // Uruguay
  'PY': 'https://flagcdn.com/w40/py.png', // Paraguay
  'GT': 'https://flagcdn.com/w40/gt.png', // Guatemala
  'HN': 'https://flagcdn.com/w40/hn.png', // Honduras
  'GB': 'https://flagcdn.com/w40/gb.png', // United Kingdom
  'FR': 'https://flagcdn.com/w40/fr.png', // France
  'DE': 'https://flagcdn.com/w40/de.png', // Germany
  'IT': 'https://flagcdn.com/w40/it.png', // Italy
  
  // Other major countries
  'US': 'https://flagcdn.com/w40/us.png', // United States
  'CA': 'https://flagcdn.com/w40/ca.png', // Canada
  'IN': 'https://flagcdn.com/w40/in.png', // India
  'JP': 'https://flagcdn.com/w40/jp.png', // Japan
  'AU': 'https://flagcdn.com/w40/au.png', // Australia
  'BR': 'https://flagcdn.com/w40/br.png', // Brazil
  'MX': 'https://flagcdn.com/w40/mx.png', // Mexico
  'CN': 'https://flagcdn.com/w40/cn.png', // China
  'KR': 'https://flagcdn.com/w40/kr.png', // South Korea
  'RU': 'https://flagcdn.com/w40/ru.png', // Russia
  'ZA': 'https://flagcdn.com/w40/za.png', // South Africa
  'ES': 'https://flagcdn.com/w40/es.png', // Spain
  'AR': 'https://flagcdn.com/w40/ar.png', // Argentina
  'NL': 'https://flagcdn.com/w40/nl.png', // Netherlands
  'SE': 'https://flagcdn.com/w40/se.png', // Sweden
  'NO': 'https://flagcdn.com/w40/no.png', // Norway
  'CH': 'https://flagcdn.com/w40/ch.png', // Switzerland
  'TR': 'https://flagcdn.com/w40/tr.png', // Turkey
  'SA': 'https://flagcdn.com/w40/sa.png', // Saudi Arabia
  'AE': 'https://flagcdn.com/w40/ae.png', // United Arab Emirates
  'ID': 'https://flagcdn.com/w40/id.png', // Indonesia
  'TH': 'https://flagcdn.com/w40/th.png', // Thailand
  'VN': 'https://flagcdn.com/w40/vn.png', // Vietnam
  'PH': 'https://flagcdn.com/w40/ph.png', // Philippines
  'PK': 'https://flagcdn.com/w40/pk.png', // Pakistan
  'BD': 'https://flagcdn.com/w40/bd.png', // Bangladesh
  'EG': 'https://flagcdn.com/w40/eg.png', // Egypt
  'NG': 'https://flagcdn.com/w40/ng.png', // Nigeria
  'KE': 'https://flagcdn.com/w40/ke.png', // Kenya
  'ET': 'https://flagcdn.com/w40/et.png', // Ethiopia
  'PL': 'https://flagcdn.com/w40/pl.png', // Poland
  'UA': 'https://flagcdn.com/w40/ua.png', // Ukraine
  'RO': 'https://flagcdn.com/w40/ro.png', // Romania
  'AT': 'https://flagcdn.com/w40/at.png', // Austria
  'GR': 'https://flagcdn.com/w40/gr.png', // Greece
  'CZ': 'https://flagcdn.com/w40/cz.png', // Czech Republic
  'BE': 'https://flagcdn.com/w40/be.png', // Belgium
  'PT': 'https://flagcdn.com/w40/pt.png', // Portugal
  'IL': 'https://flagcdn.com/w40/il.png', // Israel
  'NZ': 'https://flagcdn.com/w40/nz.png', // New Zealand
  'SG': 'https://flagcdn.com/w40/sg.png', // Singapore
  'MY': 'https://flagcdn.com/w40/my.png', // Malaysia
  'DK': 'https://flagcdn.com/w40/dk.png', // Denmark
  'FI': 'https://flagcdn.com/w40/fi.png', // Finland
  'HU': 'https://flagcdn.com/w40/hu.png', // Hungary
  'SK': 'https://flagcdn.com/w40/sk.png', // Slovakia
  'SI': 'https://flagcdn.com/w40/si.png', // Slovenia
  'HR': 'https://flagcdn.com/w40/hr.png', // Croatia
  'RS': 'https://flagcdn.com/w40/rs.png', // Serbia
  'BG': 'https://flagcdn.com/w40/bg.png', // Bulgaria
  'LT': 'https://flagcdn.com/w40/lt.png', // Lithuania
  'LV': 'https://flagcdn.com/w40/lv.png', // Latvia
  'EE': 'https://flagcdn.com/w40/ee.png', // Estonia
  'IS': 'https://flagcdn.com/w40/is.png', // Iceland
  'LU': 'https://flagcdn.com/w40/lu.png', // Luxembourg
  'MT': 'https://flagcdn.com/w40/mt.png', // Malta
  'CY': 'https://flagcdn.com/w40/cy.png', // Cyprus
  'IE': 'https://flagcdn.com/w40/ie.png', // Ireland
  'QA': 'https://flagcdn.com/w40/qa.png', // Qatar
  'KW': 'https://flagcdn.com/w40/kw.png', // Kuwait
  'OM': 'https://flagcdn.com/w40/om.png', // Oman
  'BH': 'https://flagcdn.com/w40/bh.png', // Bahrain
  'JO': 'https://flagcdn.com/w40/jo.png', // Jordan
  'LB': 'https://flagcdn.com/w40/lb.png', // Lebanon
  'MA': 'https://flagcdn.com/w40/ma.png', // Morocco
  'DZ': 'https://flagcdn.com/w40/dz.png', // Algeria
  'TN': 'https://flagcdn.com/w40/tn.png', // Tunisia
  'LY': 'https://flagcdn.com/w40/ly.png', // Libya
  'SD': 'https://flagcdn.com/w40/sd.png', // Sudan
  'GH': 'https://flagcdn.com/w40/gh.png', // Ghana
  'CI': 'https://flagcdn.com/w40/ci.png', // Ivory Coast
  'CM': 'https://flagcdn.com/w40/cm.png', // Cameroon
  'TZ': 'https://flagcdn.com/w40/tz.png', // Tanzania
  'UG': 'https://flagcdn.com/w40/ug.png', // Uganda
  'ZM': 'https://flagcdn.com/w40/zm.png', // Zambia
  'ZW': 'https://flagcdn.com/w40/zw.png', // Zimbabwe
  'MZ': 'https://flagcdn.com/w40/mz.png', // Mozambique
  'AO': 'https://flagcdn.com/w40/ao.png', // Angola
  'BW': 'https://flagcdn.com/w40/bw.png', // Botswana
  'NA': 'https://flagcdn.com/w40/na.png', // Namibia
  'SN': 'https://flagcdn.com/w40/sn.png', // Senegal
  'ML': 'https://flagcdn.com/w40/ml.png', // Mali
  'NE': 'https://flagcdn.com/w40/ne.png', // Niger
  'BF': 'https://flagcdn.com/w40/bf.png', // Burkina Faso
  'CD': 'https://flagcdn.com/w40/cd.png', // Democratic Republic of the Congo
  'CG': 'https://flagcdn.com/w40/cg.png', // Republic of the Congo
  'MG': 'https://flagcdn.com/w40/mg.png', // Madagascar
  'LK': 'https://flagcdn.com/w40/lk.png', // Sri Lanka
  'NP': 'https://flagcdn.com/w40/np.png', // Nepal
  'AF': 'https://flagcdn.com/w40/af.png', // Afghanistan
  'KZ': 'https://flagcdn.com/w40/kz.png', // Kazakhstan
  'UZ': 'https://flagcdn.com/w40/uz.png', // Uzbekistan
  'TM': 'https://flagcdn.com/w40/tm.png', // Turkmenistan
  'KG': 'https://flagcdn.com/w40/kg.png', // Kyrgyzstan
  'TJ': 'https://flagcdn.com/w40/tj.png', // Tajikistan
  'AM': 'https://flagcdn.com/w40/am.png', // Armenia
  'GE': 'https://flagcdn.com/w40/ge.png', // Georgia
  'AZ': 'https://flagcdn.com/w40/az.png', // Azerbaijan
  'MN': 'https://flagcdn.com/w40/mn.png', // Mongolia
  'KP': 'https://flagcdn.com/w40/kp.png', // North Korea
  'LA': 'https://flagcdn.com/w40/la.png', // Laos
  'KH': 'https://flagcdn.com/w40/kh.png', // Cambodia
  'MM': 'https://flagcdn.com/w40/mm.png', // Myanmar
  'BN': 'https://flagcdn.com/w40/bn.png', // Brunei
  'TL': 'https://flagcdn.com/w40/tl.png', // East Timor
  'MV': 'https://flagcdn.com/w40/mv.png', // Maldives
  'BT': 'https://flagcdn.com/w40/bt.png', // Bhutan
  'MD': 'https://flagcdn.com/w40/md.png', // Moldova
  'BY': 'https://flagcdn.com/w40/by.png', // Belarus
  'BA': 'https://flagcdn.com/w40/ba.png', // Bosnia and Herzegovina
  'AL': 'https://flagcdn.com/w40/al.png', // Albania
  'MK': 'https://flagcdn.com/w40/mk.png', // North Macedonia
  'ME': 'https://flagcdn.com/w40/me.png', // Montenegro
  'XK': 'https://flagcdn.com/w40/xk.png', // Kosovo
  'PS': 'https://flagcdn.com/w40/ps.png', // Palestine
  'SY': 'https://flagcdn.com/w40/sy.png', // Syria
  'IQ': 'https://flagcdn.com/w40/iq.png', // Iraq
  'YE': 'https://flagcdn.com/w40/ye.png', // Yemen
  'IR': 'https://flagcdn.com/w40/ir.png', // Iran
  'SV': 'https://flagcdn.com/w40/sv.png', // El Salvador
  'NI': 'https://flagcdn.com/w40/ni.png', // Nicaragua
  'CR': 'https://flagcdn.com/w40/cr.png', // Costa Rica
  'PA': 'https://flagcdn.com/w40/pa.png', // Panama
  'CU': 'https://flagcdn.com/w40/cu.png', // Cuba
  'DO': 'https://flagcdn.com/w40/do.png', // Dominican Republic
  'HT': 'https://flagcdn.com/w40/ht.png', // Haiti
  'JM': 'https://flagcdn.com/w40/jm.png', // Jamaica
  'TT': 'https://flagcdn.com/w40/tt.png', // Trinidad and Tobago
  'BB': 'https://flagcdn.com/w40/bb.png', // Barbados
  'BS': 'https://flagcdn.com/w40/bs.png', // Bahamas
  'LC': 'https://flagcdn.com/w40/lc.png', // Saint Lucia
  'GD': 'https://flagcdn.com/w40/gd.png', // Grenada
  'VC': 'https://flagcdn.com/w40/vc.png', // Saint Vincent and the Grenadines
  'AG': 'https://flagcdn.com/w40/ag.png', // Antigua and Barbuda
  'DM': 'https://flagcdn.com/w40/dm.png', // Dominica
  'KN': 'https://flagcdn.com/w40/kn.png', // Saint Kitts and Nevis
  'BZ': 'https://flagcdn.com/w40/bz.png', // Belize
  'SR': 'https://flagcdn.com/w40/sr.png', // Suriname
  'GY': 'https://flagcdn.com/w40/gy.png', // Guyana
  'VE': 'https://flagcdn.com/w40/ve.png', // Venezuela
  'BO': 'https://flagcdn.com/w40/bo.png', // Bolivia
  'EC': 'https://flagcdn.com/w40/ec.png', // Ecuador
  'AD': 'https://flagcdn.com/w40/ad.png', // Andorra
  'LI': 'https://flagcdn.com/w40/li.png', // Liechtenstein
  'SM': 'https://flagcdn.com/w40/sm.png', // San Marino
  'MC': 'https://flagcdn.com/w40/mc.png', // Monaco
  'VA': 'https://flagcdn.com/w40/va.png', // Vatican City
  'SC': 'https://flagcdn.com/w40/sc.png', // Seychelles
  'MU': 'https://flagcdn.com/w40/mu.png', // Mauritius
  'KM': 'https://flagcdn.com/w40/km.png', // Comoros
  'ST': 'https://flagcdn.com/w40/st.png', // Sao Tome and Principe
  'CV': 'https://flagcdn.com/w40/cv.png', // Cape Verde
  'MW': 'https://flagcdn.com/w40/mw.png', // Malawi
  'LS': 'https://flagcdn.com/w40/ls.png', // Lesotho
  'SZ': 'https://flagcdn.com/w40/sz.png', // Eswatini
  'GA': 'https://flagcdn.com/w40/ga.png', // Gabon
  'GQ': 'https://flagcdn.com/w40/gq.png', // Equatorial Guinea
  'CF': 'https://flagcdn.com/w40/cf.png', // Central African Republic
  'TD': 'https://flagcdn.com/w40/td.png', // Chad
  'SS': 'https://flagcdn.com/w40/ss.png', // South Sudan
  'GN': 'https://flagcdn.com/w40/gn.png', // Guinea
  'GW': 'https://flagcdn.com/w40/gw.png', // Guinea-Bissau
  'SL': 'https://flagcdn.com/w40/sl.png', // Sierra Leone
  'LR': 'https://flagcdn.com/w40/lr.png', // Liberia
  'GM': 'https://flagcdn.com/w40/gm.png', // Gambia
  'TG': 'https://flagcdn.com/w40/tg.png', // Togo
  'BJ': 'https://flagcdn.com/w40/bj.png', // Benin
  'DJ': 'https://flagcdn.com/w40/dj.png', // Djibouti
  'ER': 'https://flagcdn.com/w40/er.png', // Eritrea
  'SO': 'https://flagcdn.com/w40/so.png', // Somalia
  'BI': 'https://flagcdn.com/w40/bi.png', // Burundi
  'RW': 'https://flagcdn.com/w40/rw.png', // Rwanda
  'PG': 'https://flagcdn.com/w40/pg.png', // Papua New Guinea
  'FJ': 'https://flagcdn.com/w40/fj.png', // Fiji
  'WS': 'https://flagcdn.com/w40/ws.png', // Samoa
  'TO': 'https://flagcdn.com/w40/to.png', // Tonga
  'VU': 'https://flagcdn.com/w40/vu.png', // Vanuatu
  'SB': 'https://flagcdn.com/w40/sb.png', // Solomon Islands
  'KI': 'https://flagcdn.com/w40/ki.png', // Kiribati
  'MH': 'https://flagcdn.com/w40/mh.png', // Marshall Islands
  'PW': 'https://flagcdn.com/w40/pw.png', // Palau
  'FM': 'https://flagcdn.com/w40/fm.png', // Micronesia
  'NR': 'https://flagcdn.com/w40/nr.png', // Nauru
  'TV': 'https://flagcdn.com/w40/tv.png', // Tuvalu
  'NU': 'https://flagcdn.com/w40/nu.png', // Niue
  'CK': 'https://flagcdn.com/w40/ck.png', // Cook Islands
  'TK': 'https://flagcdn.com/w40/tk.png', // Tokelau
  'EH': 'https://flagcdn.com/w40/eh.png', // Western Sahara
  'GS': 'https://flagcdn.com/w40/gs.png', // South Georgia and the South Sandwich Islands
  'PM': 'https://flagcdn.com/w40/pm.png', // Saint Pierre and Miquelon
  'BM': 'https://flagcdn.com/w40/bm.png', // Bermuda
  'GL': 'https://flagcdn.com/w40/gl.png', // Greenland
  'GG': 'https://flagcdn.com/w40/gg.png', // Guernsey
  'JE': 'https://flagcdn.com/w40/je.png', // Jersey
  'IM': 'https://flagcdn.com/w40/im.png', // Isle of Man
  'FO': 'https://flagcdn.com/w40/fo.png', // Faroe Islands
  'FK': 'https://flagcdn.com/w40/fk.png', // Falkland Islands (Malvinas)
  'GI': 'https://flagcdn.com/w40/gi.png', // Gibraltar
  'MS': 'https://flagcdn.com/w40/ms.png', // Montserrat
  'AI': 'https://flagcdn.com/w40/ai.png', // Anguilla
  'VG': 'https://flagcdn.com/w40/vg.png', // British Virgin Islands
  'KY': 'https://flagcdn.com/w40/ky.png', // Cayman Islands
  'TC': 'https://flagcdn.com/w40/tc.png', // Turks and Caicos Islands
  'SH': 'https://flagcdn.com/w40/sh.png', // Saint Helena, Ascension and Tristan da Cunha
  'PN': 'https://flagcdn.com/w40/pn.png', // Pitcairn
  'GF': 'https://flagcdn.com/w40/gf.png', // French Guiana
  'GP': 'https://flagcdn.com/w40/gp.png', // Guadeloupe
  'MQ': 'https://flagcdn.com/w40/mq.png', // Martinique
  'RE': 'https://flagcdn.com/w40/re.png', // Réunion
  'YT': 'https://flagcdn.com/w40/yt.png', // Mayotte
  'NC': 'https://flagcdn.com/w40/nc.png', // New Caledonia
  'PF': 'https://flagcdn.com/w40/pf.png', // French Polynesia
  'WF': 'https://flagcdn.com/w40/wf.png', // Wallis and Futuna
  'BL': 'https://flagcdn.com/w40/bl.png', // Saint Barthélemy
  'MF': 'https://flagcdn.com/w40/mf.png', // Saint Martin (French part)
  'SX': 'https://flagcdn.com/w40/sx.png', // Sint Maarten (Dutch part)
  'AW': 'https://flagcdn.com/w40/aw.png', // Aruba
  'CW': 'https://flagcdn.com/w40/cw.png', // Curaçao
  'BQ': 'https://flagcdn.com/w40/bq.png', // Bonaire, Sint Eustatius and Saba
  'AX': 'https://flagcdn.com/w40/ax.png', // Åland Islands
};

// Function to get flag URL for a country code with fallback CDNs
export const getCountryFlag = (countryCode: string): string => {
  const normalizedCode = countryCode.toUpperCase();
  const primaryUrl = countryFlags[normalizedCode];
  
  if (primaryUrl) {
    return primaryUrl;
  }
  
  // Fallback to flagpedia.net if not found in primary CDN
  return `https://flagpedia.net/data/flags/w40/${normalizedCode.toLowerCase()}.png`;
};

// Function to get flag URL with custom size
export const getCountryFlagWithSize = (countryCode: string, size: number = 40): string => {
  const baseUrl = getCountryFlag(countryCode);
  
  // Replace size in URL if it's a flagcdn.com URL
  if (baseUrl.includes('flagcdn.com')) {
    return baseUrl.replace('/w40/', `/w${size}/`);
  }
  
  // For flagpedia.net, use the size parameter
  if (baseUrl.includes('flagpedia.net')) {
    return baseUrl.replace('/w40/', `/w${size}/`);
  }
  
  return baseUrl;
};

// Function to get multiple CDN URLs for a country (for fallback purposes)
export const getCountryFlagUrls = (countryCode: string, size: number = 40): string[] => {
  const normalizedCode = countryCode.toUpperCase();
  const urls = [];
  
  // Primary CDN
  if (countryFlags[normalizedCode]) {
    urls.push(countryFlags[normalizedCode].replace('/w40/', `/w${size}/`));
  }
  
  // Fallback CDNs
  urls.push(`https://flagpedia.net/data/flags/w${size}/${normalizedCode.toLowerCase()}.png`);
  urls.push(`https://restcountries.eu/data/${normalizedCode.toLowerCase()}.svg`);
  
  return urls;
};

