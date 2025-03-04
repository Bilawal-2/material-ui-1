/* eslint-disable react/no-danger */
import * as React from 'react';
import PropTypes from 'prop-types';
import { exactProp } from '@mui/utils';
import Typography from '@mui/material/Typography';
import { useTranslate, useUserLanguage } from 'docs/src/modules/utils/i18n';
import PropertiesTable from 'docs/src/modules/components/PropertiesTable';
import HighlightedCode from 'docs/src/modules/components/HighlightedCode';
import MarkdownElement from 'docs/src/modules/components/MarkdownElement';
import AppLayoutDocs from 'docs/src/modules/components/AppLayoutDocs';
import Ad from 'docs/src/modules/components/Ad';

function ClassesTable(props) {
  const { componentStyles, classDescriptions } = props;
  const t = useTranslate();

  return (
    <table>
      <thead>
        <tr>
          <th align="left">{t('api-docs.ruleName')}</th>
          <th align="left">{t('api-docs.globalClass')}</th>
          <th align="left">{t('api-docs.description')}</th>
        </tr>
      </thead>
      <tbody>
        {componentStyles.classes.map((className) => (
          <tr key={className}>
            <td align="left">
              <span className="prop-name">{className}</span>
            </td>
            <td align="left">
              <span className="prop-name">
                .
                {componentStyles.globalClasses[className] || `${componentStyles.name}-${className}`}
              </span>
            </td>
            <td
              align="left"
              dangerouslySetInnerHTML={{
                __html:
                  classDescriptions[className] &&
                  classDescriptions[className].description
                    .replace(/{{conditions}}/, classDescriptions[className].conditions)
                    .replace(/{{nodeName}}/, classDescriptions[className].nodeName),
              }}
            />
          </tr>
        ))}
      </tbody>
    </table>
  );
}

ClassesTable.propTypes = {
  classDescriptions: PropTypes.object.isRequired,
  componentStyles: PropTypes.object.isRequired,
};

function getTranslatedHeader(t, header) {
  const translations = {
    demos: t('api-docs.demos'),
    import: t('api-docs.import'),
    'component-name': t('api-docs.componentName'),
    props: t('api-docs.props'),
    inheritance: t('api-docs.inheritance'),
    css: 'CSS',
  };

  // TODO Drop runtime type-checking once we type-check this file
  if (!translations.hasOwnProperty(header)) {
    throw new TypeError(
      `Unable to translate header '${header}'. Did you mean one of '${Object.keys(
        translations,
      ).join("', '")}'`,
    );
  }

  return translations[header] || header;
}

function Heading(props) {
  const { hash, level: Level = 'h2' } = props;
  const t = useTranslate();

  return (
    <Level id={hash}>
      {getTranslatedHeader(t, hash)}
      <a aria-labelledby={hash} className="anchor-link" href={`#${hash}`} tabIndex={-1}>
        <svg>
          <use xlinkHref="#anchor-link-icon" />
        </svg>
      </a>
    </Level>
  );
}

Heading.propTypes = {
  hash: PropTypes.string.isRequired,
  level: PropTypes.string,
};

export default function ApiPage(props) {
  const { descriptions, disableAd = false, pageContent } = props;
  const t = useTranslate();
  const userLanguage = useUserLanguage();

  const {
    cssComponent,
    demos,
    filename,
    forwardsRefTo,
    inheritance,
    name: componentName,
    props: componentProps,
    spread,
    styles: componentStyles,
  } = pageContent;

  const {
    componentDescription,
    componentDescriptionToc = [],
    classDescriptions,
    propDescriptions,
  } = descriptions[userLanguage];
  const description = t('api-docs.pageDescription').replace(/{{name}}/, componentName);

  const source = filename
    .replace(/\/packages\/mui(-(.+?))?\/src/, (match, dash, pkg) => `@mui/${pkg}`)
    // convert things like `/Table/Table.js` to ``
    .replace(/\/([^/]+)\/\1\.(js|tsx)$/, '');

  // Prefer linking the .tsx or .d.ts for the "Edit this page" link.
  const apiSourceLocation = filename.replace('.js', '.d.ts');

  function createTocEntry(sectionName) {
    return {
      text: getTranslatedHeader(t, sectionName),
      hash: sectionName,
      children: [
        ...(sectionName === 'props' && inheritance
          ? [{ text: t('api-docs.inheritance'), hash: 'inheritance', children: [] }]
          : []),
      ],
    };
  }

  const toc = [
    createTocEntry('demos'),
    createTocEntry('import'),
    ...componentDescriptionToc,
    componentStyles.name && createTocEntry('component-name'),
    createTocEntry('props'),
    componentStyles.classes.length > 0 && createTocEntry('css'),
  ].filter(Boolean);

  // The `ref` is forwarded to the root element.
  let refHint = t('api-docs.refRootElement');
  if (forwardsRefTo == null) {
    // The component cannot hold a ref.
    refHint = t('api-docs.refNotHeld');
  }

  let spreadHint = '';
  if (spread) {
    // Any other props supplied will be provided to the root element ({{spreadHintElement}}).
    spreadHint = t('api-docs.spreadHint').replace(
      /{{spreadHintElement}}/,
      inheritance
        ? `<a href="${inheritance.pathname}">${inheritance.component}</a>`
        : t('api-docs.nativeElement'),
    );
  }

  let inheritanceSuffix = '';
  if (inheritance && inheritance.component === 'Transition') {
    inheritanceSuffix = t('api-docs.inheritanceSuffixTransition');
  }

  return (
    <AppLayoutDocs
      description={description}
      disableAd={disableAd}
      disableToc={false}
      location={apiSourceLocation}
      title={`${componentName} API`}
      toc={toc}
    >
      <MarkdownElement>
        <h1>{componentName} API</h1>
        <Typography
          variant="h5"
          component="p"
          className={`description${disableAd ? '' : ' ad'}`}
          gutterBottom
        >
          {description}
          {disableAd ? null : <Ad />}
        </Typography>
        <Heading hash="demos" />
        <div
          className="MuiCallout-root MuiCallout-info"
          dangerouslySetInnerHTML={{
            __html: `<p>For examples and details on the usage of this React component, visit the component demo pages:</p>
              ${demos}`,
          }}
        />
        <Heading hash="import" />
        <HighlightedCode
          code={`
import ${componentName} from '${source}/${componentName}';
// ${t('or')}
import { ${componentName} } from '${source}';`}
          language="jsx"
        />
        <span dangerouslySetInnerHTML={{ __html: t('api-docs.importDifference') }} />
        {componentDescription ? (
          <React.Fragment>
            <br />
            <br />
            <span
              dangerouslySetInnerHTML={{
                __html: componentDescription,
              }}
            />
          </React.Fragment>
        ) : null}
        {componentStyles.name && (
          <React.Fragment>
            <Heading hash="component-name" />
            <span
              dangerouslySetInnerHTML={{
                __html: t('api-docs.styleOverrides').replace(
                  /{{componentStyles\.name}}/,
                  componentStyles.name,
                ),
              }}
            />
          </React.Fragment>
        )}
        <Heading hash="props" />
        <p dangerouslySetInnerHTML={{ __html: spreadHint }} />
        <PropertiesTable properties={componentProps} propertiesDescriptions={propDescriptions} />
        <br />
        {cssComponent && (
          <React.Fragment>
            <span
              dangerouslySetInnerHTML={{
                __html: t('api-docs.cssComponent').replace(/{{name}}/, componentName),
              }}
            />
            <br />
            <br />
          </React.Fragment>
        )}
        <span dangerouslySetInnerHTML={{ __html: refHint }} />
        {inheritance && (
          <React.Fragment>
            <Heading hash="inheritance" level="h3" />
            <span
              dangerouslySetInnerHTML={{
                __html: t('api-docs.inheritanceDescription')
                  .replace(/{{component}}/, inheritance.component)
                  .replace(/{{pathname}}/, inheritance.pathname)
                  .replace(/{{suffix}}/, inheritanceSuffix)
                  .replace(/{{componentName}}/, componentName),
              }}
            />
          </React.Fragment>
        )}
        {Object.keys(componentStyles.classes).length ? (
          <React.Fragment>
            <Heading hash="css" />
            <ClassesTable componentStyles={componentStyles} classDescriptions={classDescriptions} />
            <br />
            <span dangerouslySetInnerHTML={{ __html: t('api-docs.overrideStyles') }} />
            <span
              dangerouslySetInnerHTML={{ __html: t('api-docs.overrideStylesStyledComponent') }}
            />
          </React.Fragment>
        ) : null}
      </MarkdownElement>
      <svg style={{ display: 'none' }} xmlns="http://www.w3.org/2000/svg">
        <symbol id="anchor-link-icon" viewBox="0 0 16 16">
          <path d="M4 9h1v1H4c-1.5 0-3-1.69-3-3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0 1.41-.91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c-.98 0-2 1.22-2 2.5S3 9 4 9zm9-3h-1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c-.98 0-2-1.22-2-2.5 0-.83.42-1.64 1-2.09V6.25c-1.09.53-2 1.84-2 3.25C6 11.31 7.55 13 9 13h4c1.45 0 3-1.69 3-3.5S14.5 6 13 6z" />
        </symbol>
      </svg>
    </AppLayoutDocs>
  );
}

ApiPage.propTypes = {
  descriptions: PropTypes.object.isRequired,
  disableAd: PropTypes.bool,
  pageContent: PropTypes.object.isRequired,
};

if (process.env.NODE_ENV !== 'production') {
  ApiPage.propTypes = exactProp(ApiPage.propTypes);
}
