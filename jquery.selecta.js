(function($) {

    $.fn.selectaValues = function() {
      console.log($(this).data('selects'));
      // var selectaDom = $(this).next('.selectaDom');
      // console.log(selectaDom);
    };

    $.fn.selecta = function() {
      l('selecta called');
      this.doms = [];
      console.log(1, this);
      var _t = this;
      
      return $.each(this, function(selIdx, sel) {
        var order = [];
        _t.doms[selIdx] = [];

        // Hide original select element
        $(sel).hide();


        _self.multiple = $(sel).prop('multiple');
        
        $(sel).after('<div class="selectaDom clearfix">'
                        + '<div class="selecta-sel"></div>'
                        + '<ul class="selecta-list" data-idx="'+ selIdx +'"></ul>'
                        + '<div class="selecta-hidden" style="display:none;"></div>'
                      + '</div>');
        selectaDom = $(sel).next('.selectaDom');

        var options = [];

        $.each($(sel).find('option'), function(optIdx, opt) {
          var v = $(opt).prop('value'),
              t = $(opt).text()
          options[optIdx] = { v: v, t: t };
          selectaDom.find('.selecta-list').append('<li value="'+ v +'">'+ t +'</li>')
        });

        // events
        // =================
        selectaDom.find('.selecta-sel').on('click', function(e) {
        // selectaDom.find('.selecta-sel').off('click').on('click', function(e) {
          if($(e.currentTarget).siblings('.selecta-list').is(':visible')) {
            $(e.currentTarget).siblings('.selecta-list').hide();
          } else {
            $(e.currentTarget).siblings('.selecta-list').show();
          }
        });


        // ==================
        selectaDom.find('.selecta-sel').on('click', 'span.label > span.glyphicon-remove', function(e) {
        // selectaDom.find('.selecta-sel span.glyphicon-remove').off('click').on('click', 'span.label > span.glyphicon-remove', function(e) {
          e.preventDefault();

          var el = $(this).siblings('span');
          var v = el.data('v');
          var t = el.text();
          // console.log(v, t);

          var list = order[selIdx];
          order[selIdx] = list.filter( function ( obj ) {
            return (obj.v !== v && obj.t !== t);
          });

          selecta_li = selectaDom.find('.selecta-list > li.selected[value="'+v+'"]');
          $.each(selecta_li, function ( idxLi, li ) {
            if($(li).html() === t) {
              $(li).removeClass('selected');
            }
          })
          console.log(selecta_li);
          // $(this).pare.removeClass('selected');


          var thisSel = $(selectaDom).find('.selecta-sel')
          thisSel.empty()
          $(order[selIdx]).each(function(_idx, i) {
            thisSel.append('<span class="label label-info"><span data-v="'+ i.v +'">'+ i.t +'</span><span class="glyphicon glyphicon-remove"></span></span>')
          });
          return false;
        });



        // ===================
        // Add new option from list

        $(selectaDom).find('.selecta-list > li').off('click').on('click', function(e) {
          // console.log($(e.currentTarget).attr('value'));
          // console.log($(e.currentTarget).prop('value'));
          // var v = e.currentTarget.value;
          var v = $(e.currentTarget).attr('value');
          var t = e.currentTarget.textContent;

          var idx = +$(e.currentTarget).parent().data('idx');
          if(order[idx] == undefined) {
            order[idx] = [];
          }

          var list = order[idx];
          var itm = list.find( function( obj ) { 
            return (obj.v === v && obj.t === t);
          });
          if(itm == undefined) {
            l(_self.multiple)
            if(_self.multiple) {
              list.push({v: v, t: t})
            } else {
              list = [{v: v, t: t}];
              l(list);
              $(e.currentTarget).siblings('li').removeClass('selected');
            }
            $(e.currentTarget).addClass('selected'); 
          } else {
            order[idx] = list.filter( function(itmObj) {
              return (itmObj.v !== v && itmObj.t !== t);
            });
            // order[idx] = _.without(list, itm);
            $(e.currentTarget).removeClass('selected');
          }
          var el = $(selectaDom).find('.selecta-sel')
          el.empty()
          $(order[idx]).each(function(_idx, i) {
            el.append('<span class="label label-info"><span data-v="'+ i.v +'">'+ i.t +'</span><span class="glyphicon glyphicon-remove"></span></span>')
          });
          // Hide list
          $(e.currentTarget).parent().hide();

          $(sel).data('selects', JSON.stringify(order[idx]));
        });
      });

    };

}(jQuery));