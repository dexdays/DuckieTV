angular.module('DuckieTV.controllers.settings', ['DuckieTV.providers.storagesync', 'DuckieTV.providers.eventscheduler'])


.controller('SettingsCtrl', function($scope, $location, $rootScope, StorageSyncService, FavoritesService, SettingsService, MirrorResolver, TraktTV, $translate, tmhDynamicLocale, EventSchedulerService, $filter) {

    $scope.custommirror = SettingsService.get('thepiratebay.mirror');
    $scope.searchprovider = SettingsService.get('torrenting.searchprovider');
    $scope.searchquality = SettingsService.get('torrenting.searchquality');
    $scope.bgopacity = SettingsService.get('background-rotator.opacity');
    $scope.mirrorStatus = [];
    $scope.log = [];
    $scope.hasTopSites = ('topSites' in window.chrome);
    $scope.locale = SettingsService.get('application.locale');

    $scope.activesettings = 'templates/settings/default.html';

    /*
     * set up the language list used in settings/display template
     */
    $scope.languageList = [{
        locale: SettingsService.get('client.determinedlocale'),
        name: SettingsService.get('client.determinedlocale') + " " + $filter('translate')('DISPLAY/locale-default/lbl')
    }, {
        locale: 'en_au',
        name: $filter('translate')('DISPLAY/locale/au')
    }, {
        locale: 'en_nz',
        name: $filter('translate')('DISPLAY/locale/nz')
    }, {
        locale: 'en_uk',
        name: $filter('translate')('DISPLAY/locale/uk')
    }, {
        locale: 'en_us',
        name: $filter('translate')('DISPLAY/locale/us')
    }, {
        locale: 'de_de',
        name: $filter('translate')('DISPLAY/locale/de_de')
    }, {
        locale: 'es_419',
        name: $filter('translate')('DISPLAY/locale/es_419')
    }, {
        locale: 'es_es',
        name: $filter('translate')('DISPLAY/locale/es_es')
    }, {
        locale: 'fr_fr',
        name: $filter('translate')('DISPLAY/locale/fr_fr')
    }, {
        locale: 'it_it',
        name: $filter('translate')('DISPLAY/locale/it_it')
    }, {
        locale: 'ja_jp',
        name: $filter('translate')('DISPLAY/locale/ja_jp')
    }, {
        locale: 'ko_kr',
        name: $filter('translate')('DISPLAY/locale/ko_kr')
    }, {
        locale: 'nl_nl',
        name: $filter('translate')('DISPLAY/locale/nl_nl')
    }, {
        locale: 'pt_pt',
        name: $filter('translate')('DISPLAY/locale/pt_pt')
    }, {
        locale: 'ru_ru',
        name: $filter('translate')('DISPLAY/locale/ru_ru')
    }, {
        locale: 'sv_se',
        name: $filter('translate')('DISPLAY/locale/sv_se')
    }, {
        locale: 'zh_cn',
        name: $filter('translate')('DISPLAY/locale/zh_cn')
    }];

    /**
     * Change the active settings tab
     */
    $scope.setActiveSetting = function(setting) {
        console.log("setting active setting", setting)
        $scope.activesettings = 'templates/settings/' + setting + '.html';
    }

    /**
     * Inject an event to display mirror resolving progress.
     */
    $rootScope.$on('mirrorresolver:status', function(evt, status) {
        $scope.mirrorStatus.unshift(status);
    });

    /**
     * Fire off an event that pushes the current series list into the cloud
     */
    $scope.sync = function() {
        console.log("Synchronizging!");
        StorageSyncService.synchronize()
    }

    /**
     * Change localization an translations, reloads translation table.
     */
    $scope.setLocale = function(lang) {
        SettingsService.changeLanguage(lang);
        $scope.locale = lang;
    }

    /**
     * Change the default torrent search provider
     */
    $scope.setSearchProvider = function(provider) {
        $scope.searchprovider = provider;
        SettingsService.set('torrenting.searchprovider', provider);
    }

    /**
     * Changes the default torrent search quality (hdtv, 720p, etc)
     */
    $scope.setSearchQuality = function(quality) {
        console.log("Setting searchquality: ", quality);
        $rootScope.setSetting('torrenting.searchquality', quality);
        $scope.searchquality = quality;
    }

    /**
     * Set the various background opacity levels.
     */
    $scope.setBGOpacity = function(opacity) {
        $rootScope.setSetting('background-rotator.opacity', opacity);
        $scope.bgopacity = opacity;
    }

    /**
     * Resolve a new random ThePirateBay mirror.
     * Log progress hil this is happening.
     * Save the new mirror in the thepiratebay.mirror settings key
     */
    $scope.findRandomTPBMirror = function() {
        MirrorResolver.findTPBMirror().then(function(result) {
            $scope.custommirror = result;
            SettingsService.set('thepiratebay.mirror', $scope.custommirror);
            $rootScope.$broadcast('mirrorresolver:status', 'Saved!');
        }, function(err) {
            console.debug("Could not find a working TPB mirror!", err);
        })
    }

    /**
     * Validate a mirror by checking if it doesn't proxy all links and supports magnet uri's
     */
    $scope.validateCustomMirror = function(mirror) {
        $scope.mirrorStatus = [];
        MirrorResolver.verifyMirror(mirror).then(function(result) {
            $scope.custommirror = result;
            SettingsService.set('thepiratebay.mirror', $scope.custommirror);
            $rootScope.$broadcast('mirrorresolver:status', 'Saved!');
        }, function(err) {
            console.log("Could not validate custom mirror!", mirror);
            //$scope.customMirror = '';
        })
    }


    /**
     * Create the automated download service.
     * This fires the episode:aired:check timer that the kicks it off in the background page
     */
    $scope.enableAutoDownload = function() {
        SettingsService.set('torrenting.autodownload', true);
        EventSchedulerService.createInterval(' ☠ Automated torrent download service', 1, 'episode:aired:check', {});
    }

    /**
     * Remove the auto-download event
     */
    $scope.disableAutoDownload = function() {
        SettingsService.set('torrenting.autodownload', false);
        EventSchedulerService.clear(' ☠ Automated torrent download service');
    }


    $scope.favorites = FavoritesService.favorites;
    $scope.$on('favorites:updated', function(event, data) {
        $rootScope.$broadcast('background:load', FavoritesService.favorites[Math.floor(Math.random() * FavoritesService.favorites.length)].fanart);

    });


});