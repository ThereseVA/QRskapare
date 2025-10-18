import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

import * as strings from 'QRskapareWebPartStrings';
import QRskapare from './components/QRskapare';
import { IQRskapareProps } from './components/IQRskapareProps';

// Cache busting utilities
class CacheBuster {
  private static readonly CACHE_VERSION = '1.0.0';
  private static readonly BUILD_TIMESTAMP = Date.now().toString();
  
  public static getBustingParams(): string {
    return `v=${this.CACHE_VERSION}&t=${this.BUILD_TIMESTAMP}&r=${Math.random().toString(36).substr(2, 9)}`;
  }
  
  public static addCacheBustingHeaders(): void {
    // Force no-cache headers
    const metaTags = [
      { name: 'Cache-Control', content: 'no-cache, no-store, must-revalidate, max-age=0' },
      { name: 'Pragma', content: 'no-cache' },
      { name: 'Expires', content: '0' },
      { name: 'Last-Modified', content: new Date().toUTCString() }
    ];
    
    metaTags.forEach(tag => {
      let meta = document.querySelector(`meta[http-equiv="${tag.name}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.httpEquiv = tag.name;
        document.head.appendChild(meta);
      }
      meta.content = tag.content;
    });
  }
}

export interface IQRskapareWebPartProps {
  description: string;
}

export default class QRskapareWebPart extends BaseClientSideWebPart<IQRskapareWebPartProps> {

  private _isDarkTheme: boolean = false;
  private _environmentMessage: string = '';

  public render(): void {
    const element: React.ReactElement<IQRskapareProps> = React.createElement(
      QRskapare,
      {
        description: this.properties.description,
        isDarkTheme: this._isDarkTheme,
        environmentMessage: this._environmentMessage,
        hasTeamsContext: !!this.context.sdks.microsoftTeams,
        userDisplayName: this.context.pageContext.user.displayName
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onInit(): Promise<void> {
    // Initialize mega-strong cache busting
    this._initializeCacheBusting();
    
    return this._getEnvironmentMessage().then(message => {
      this._environmentMessage = message;
    });
  }

  private _initializeCacheBusting(): void {
    try {
      // Add cache busting headers
      CacheBuster.addCacheBustingHeaders();
      
      // Force reload of any cached resources
      if (window.performance && window.performance.navigation) {
        const navType = window.performance.navigation.type;
        // If page was loaded from cache, force a hard refresh
        if (navType === 2) { // TYPE_BACK_FORWARD
          window.location.reload();
        }
      }
      
      // Clear any existing caches
      this._clearWebPartCaches();
      
      // Add version info to DOM for debugging
      const versionInfo = document.createElement('meta');
      versionInfo.name = 'qr-webpart-version';
      versionInfo.content = `${Version.parse('1.0').toString()}-${Date.now()}`;
      document.head.appendChild(versionInfo);
      
      console.log('QRskapare Cache Buster initialized:', CacheBuster.getBustingParams());
    } catch (error) {
      console.warn('Cache busting initialization failed:', error);
    }
  }

  private _clearWebPartCaches(): void {
    try {
      // Clear localStorage entries related to SPFx
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('spfx') || key.includes('sharepoint') || key.includes('qr'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Clear sessionStorage entries
      const sessionKeysToRemove: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && (key.includes('spfx') || key.includes('sharepoint') || key.includes('qr'))) {
          sessionKeysToRemove.push(key);
        }
      }
      sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key));
      
    } catch (error) {
      console.warn('Cache clearing failed:', error);
    }
  }



  private _getEnvironmentMessage(): Promise<string> {
    if (!!this.context.sdks.microsoftTeams) { // running in Teams, office.com or Outlook
      return this.context.sdks.microsoftTeams.teamsJs.app.getContext()
        .then(context => {
          let environmentMessage: string = '';
          switch (context.app.host.name) {
            case 'Office': // running in Office
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOffice : strings.AppOfficeEnvironment;
              break;
            case 'Outlook': // running in Outlook
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOutlook : strings.AppOutlookEnvironment;
              break;
            case 'Teams': // running in Teams
            case 'TeamsModern':
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentTeams : strings.AppTeamsTabEnvironment;
              break;
            default:
              environmentMessage = strings.UnknownEnvironment;
          }

          return environmentMessage;
        });
    }

    return Promise.resolve(this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentSharePoint : strings.AppSharePointEnvironment);
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) {
      return;
    }

    this._isDarkTheme = !!currentTheme.isInverted;
    const {
      semanticColors
    } = currentTheme;

    if (semanticColors) {
      this.domElement.style.setProperty('--bodyText', semanticColors.bodyText || null);
      this.domElement.style.setProperty('--link', semanticColors.link || null);
      this.domElement.style.setProperty('--linkHovered', semanticColors.linkHovered || null);
    }

  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    // Dynamic version with timestamp for mega cache busting
    const timestamp = Date.now();
    return Version.parse(`1.0.${Math.floor(timestamp / 1000)}.${timestamp % 1000}`);
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
