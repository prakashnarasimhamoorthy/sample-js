
var stockElements = new Object(null);

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




var stockQuotes = function(){
    var self = this;
    self.stockQuoteList = [];
    self.stockQuoteListObserve = ko.observableArray(self.stockQuoteList);
    self.isStockSymbolEmpty = ko.observable(false);
    self.isInvalidStartEndDates = ko.observable(false);

    this.requestData = function(){
        $.ajax({
            url: 'http://query.yahooapis.com/v1/public/yql?q=select * from yahoo.finance.historicaldata where symbol in ('+ STKPRJ.apiCalls.symbols +') and startDate = "' + STKPRJ.apiCalls.startDate + '" and endDate = "' + STKPRJ.apiCalls.endDate + '"&env=http%3A%2F%2Fdatatables.org%2Falltables.env&format=json',
            dataType: 'jsonp',
            crossDomain: true,
            type: 'GET',
            success: function(data){
                if (data && data.query && data.query.results.quote.length > 0) {
                    self.stockQuoteList = [];
                    for(var ind in data.query.results.quote){
                        self.stockQuoteList.push(data.query.results.quote[ind]);
                    }
                } else {
                    self.stockQuoteList = [];
                    self.stockQuoteList.push(data.query.results.quote);
                }
                self.stockQuoteListObserve(self.stockQuoteList);
            }
        });
    };

    this.validateEntry = function(){
        var symbols = $.trim($("input[name='stockSymbol']").val());
        var startDate = new Date($("input[name='startDate']").val());
        var endDate = new Date($("input[name='endDate']").val());
        if ($.trim($("input[name='stockSymbol']").val()) === "") {
            self.isStockSymbolEmpty(true);
            return false;
        }
        self.isStockSymbolEmpty(false);
        if (startDate > endDate) {
            self.isInvalidStartEndDates(true);
            return false;
        }
        self.isInvalidStartEndDates(false);
        symbols = symbols.split(",");
        STKPRJ.apiCalls.symbols = '';
        for(var ind in symbols) {
            STKPRJ.apiCalls.symbols += '"'+ symbols[ind] +'"';
            if ((symbols.length - 1) !== parseInt(ind, 10)) {
                STKPRJ.apiCalls.symbols += ",";
            }
        }
        
        STKPRJ.apiCalls.startDate = $("input[name='startDate']").val();
        STKPRJ.apiCalls.endDate = $("input[name='endDate']").val();
        self.requestData();
    };

    self.requestData();
}

$(function(){
    var currentDate = new Date();
    var today, yesterday;
    var currentDay = (currentDate.getDate().length > 1) ? currentDate.getDate() : ("0"+ currentDate.getDate());
    var previousDay = "0" + (currentDate.getDate() - 1);
    var currentMonth =  "0" + (currentDate.getMonth() + 1);
    today = currentDate.getFullYear() + "-" + currentMonth + "-" + currentDay;
    yesterday = currentDate.getFullYear() + "-" + currentMonth + "-" + previousDay;
    STKPRJ.apiCalls.startDate = yesterday;
    STKPRJ.apiCalls.endDate = today;

    ko.applyBindings(new stockQuotes);
    $(".datepicker.start").datepicker({
        dateFormat : "yy-mm-dd"
    }).val(yesterday);
    $(".datepicker.end").datepicker({
        dateFormat : "yy-mm-dd"
    }).val(today);
});