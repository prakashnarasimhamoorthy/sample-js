// Fashion Show APP Global Namespacing
var FSAPP = FSAPP || {};


    FSAPP.fashionShows = {};



  // Load the default module
  var fs = FSAPP.modules.fashionShow = FSAPP.module('fashionShow');
  var dc = FSAPP.modules.designerCollection = FSAPP.module('designerCollection');
  var ui = FSAPP.modules.UI = FSAPP.module('ui.common');

  FSAPP.router = new FSAPP.modules.fashionShow.Router();
  
  FSAPP.designerCollectionModel = new FSAPP.modules.designerCollection.Model({
        type : 'fs',
        url  : FSAPP.slideshowModel.get('newCollectionUrl')
      });

  // temporary namespace for the over-arching FashionShows model
  FSAPP.fsModel = new Backbone.Model({
    latestShowsUrl : latestShowsApiUrl
  });

  FSAPP.slideshowModel = new dc.Model({
    newCollectionUrl    : fsUrl,
    designerCollection  : fsDesignerName,
    seasonName          : fsSeason,
    section             : fsSection,
    slide               : null,
    seasonCode          : null,
    designerCode        : null
  });

    var view = new FSAPP.modules.fashionShow.Views.Main({
    model   : FSAPP.slideshowModel,
    tmpUrl  : fsUrl.slice(5, fsUrl.length) + "/"
  });



DesignerCollection.Model = UI.Selectable.Model.extend({
    idAttribute: 'sequenceNo',


    initialize: function(options){
      if (options) {
        this.type = options.type;
        this.url = options.url;
      }
    },

    parse: function(response){
      var attr = response;

      // Testing Instant
      // attr.live = true;

      if (this.type === 'fs') {
        attr.designerName = response.designerName;
        attr.seasonName   = response.seasonName;

        attr.sections = [];

        attr.review = {
          contentType : 'review',
          name        : 'review',
          label       : 'review',
          url         : "/fashionshows/review/slideshow/" + response.seasonCode + "-" + response.designerCode,
          restUrl     : response.restReviewUrl
        };

        attr.sections.push({
          contentType : 'gallery',
          name        : 'complete',
          label       : 'collection',
          url         : "/fashionshows/complete/slideshow/" + response.seasonCode + "-" + response.designerCode,
          restUrl     : response.restLooksUrl
        });

        if (response.hasDetails) {
          attr.sections.push({
            contentType : 'gallery',
            name        : 'detail',
            label       : 'details',
            url         : "/fashionshows/detail/slideshow/" + response.seasonCode + "-" + response.designerCode,
            restUrl     : response.restDetailsUrl
          });
        }

        if (response.hasFrontRow) {
          attr.sections.push({
            contentType : 'gallery',
            name        : 'frontrow',
            label       : 'front row',
            url         : "/fashionshows/frontrow/slideshow/" + response.seasonCode + "-" + response.designerCode,
            restUrl     : response.restFrontRowUrl
          });
        }

        if (response.hasBeauty) {
          attr.sections.push({
            contentType : 'gallery',
            name        : 'beauty',
            label       : 'beauty',
            url         : "/fashionshows/beauty/slideshow/" + response.seasonCode + "-" + response.designerCode,
            restUrl     : response.restBeautyUrl
          });
        }

        if (response.hasBackstage) {
          attr.sections.push({
            contentType : 'gallery',
            name        : 'backstage',
            label       : 'backstage',
            url         : "/fashionshows/backstage/slideshow/" + response.seasonCode + "-" + response.designerCode,
            restUrl     : response.restBackstageUrl
          });
        }

        //response.hasExtras = true;

        if (response.hasExtras) {
          // TODO: kill this
          var type;

          if (fsDesignerName === 'Balenciaga') {
            response.restExtrasUrl = '/rest/fashion-show/spring-2013-ready-to-wear/balenciaga/collection/extras';
          }

          attr.sections.push({
            contentType : 'gallery',
            name        : 'extras',
            label       : 'extras',
            url         : "/fashionshows/extras/slideshow/" + response.seasonCode + "-" + response.designerCode,
            restUrl     : response.restExtrasUrl
          });
        }
      }
      return attr;
    },

    url: function(){
      return this.url;
    },

    // Custom Getters
    getImageBySize: function(size){
      var obj = _.find(this.get('images'), function(image){
        return image.renditionGrid === size;
      });

      return obj.url;
    }
  });


  /**
   * @Collection
   * should only be one of these
   */
  DesignerCollection.Collection = UI.Selectable.Collection.extend({
    url: function(){
      return this.url;
    },

    initialize: function(options){
      this.model = options.model;
      this.url   = options.url;
    }
  });