(function($) {
  $.fn.selectaSetValues = function() {
    values = arguments;
    $.each(this, function(selIdx, sel) {
      $(sel).data('selects', JSON.stringify(values));
      // Redraw list and display
      var selectaDom = $(sel).next('.selectaDom');
      var el  = selectaDom
                  .find('.selecta-sel > li:first-child')
                  .empty();
      // Show options from selecta list
      selectaDom
        .find('.selecta-list > li')
        .removeClass('selected')
        .show()
      $(values).each(function(_idx, v) {
        var item = selectaDom
                    .find('.selecta-list > li[value="'+ v+'"]')
                    .addClass('selected')

        el.append('<span class="label label-info"><span data-v="'+ v +'">'+ item.html() +'</span><span class="glyphicon glyphicon-remove"></span></span>');

      });
    });
  }

  $.fn.selectaGetValues = function() {
    values = [];
    if(this.length > 1) {
      $.each(this, function(selIdx, sel) {
        var selects = $(sel).data('selects');
        if(selects === undefined) {
          values.push([]);
        } else {
          values.push(JSON.parse(selects));
        }
      });
    } else if(this.length === 1) {
      var selects = $(this).data('selects');
      if(selects === undefined) {
        values.push([]);
      } else {
        values.push(JSON.parse(selects));
      }
    }
    return values;
  };

  $.fn.selecta = function() {
    this.doms = [];
    var _t = this;


    // Should have a centralise function to redraw all list and selected display
    
    return $.each(this, function(selIdx, sel) {
      var order = [];
      _t.doms[selIdx] = {};
      var _self = _t.doms[selIdx];

      // Hide original select element
      $(sel).hide();

      _self.multiple = $(sel).prop('multiple');
      
      $(sel).after('<div class="selectaDom clearfix">' + 
                      '<ul class="selecta-sel" data-idx="'+ selIdx +'"><li></li><li class="selecta-search"><input class="selecta-search-input" data-idx="'+ selIdx +'" placeholder="Enter text to filter list"></li></ul>' + 
                      '<ul class="selecta-list" data-idx="'+ selIdx +'"></ul>' + 
                      '<div class="selecta-hidden" style="display:none;"></div>' + 
                    '</div>');
      var  selectaDom = $(sel).next('.selectaDom');

      var options = [];

      $.each($(sel).find('option'), function(optIdx, opt) {
        var v = $(opt).prop('value'),
            t = $(opt).text();
        options[optIdx] = { v: v, t: t };
        selectaDom.find('.selecta-list').append('<li value="'+ v +'">'+ t +'</li>');
      });

      // events
      // =================
      selectaDom.find('.selecta-sel').on('keyup', 'li.selecta-search > input.selecta-search-input', function(e) {
        var idx = +$(e.currentTarget).data('idx');
        if(e.key === "Backspace") {
          if($.isArray(order) && order.length > 0 && order[idx] !== null) {
            order[idx].pop()
            // Redraw list and display
            var el = $(selectaDom).find('.selecta-sel > li:first-child');
            el.empty();
            // Show options from selecta list
            selectaDom
              .find('.selecta-list > li')
              .removeClass('selected')
              .show()

            $(order[idx]).each(function(_idx, i) {
              el.append('<span class="label label-info"><span data-v="'+ i.v +'">'+ i.t +'</span><span class="glyphicon glyphicon-remove"></span></span>');

              selectaDom
                .find('.selecta-list > li[value="'+ i.v+'"]')
                .addClass('selected')
            });
            // Hide list
            clearTimeout(_self.dropDownListTimeout);
            // $(e.currentTarget).parent().hide();

            $(sel).data('selects', JSON.stringify(order[idx]));

            // clear search box and focus
            selectaDom.find('.selecta-sel > li.selecta-search > input.selecta-search-input').focus().val('')
          
          }
        } else {
          if(selectaDom.find('.selecta-list').is(':visible')) {
          } else {
            selectaDom.find('.selecta-list').show();
          }
          // filter select list
          t = $(this).val();
          if(t.length === 0) {
            selectaDom.find('.selecta-list > li').show();
          }
          selectaDom.find('.selecta-list > li').each( function () {
            if($(this).text().toUpperCase().search(t.toUpperCase()) === -1) {
              $(this).hide();
            } else {
              $(this).show();
            }
          })
          
        }
      });


      // =================
      // Trigger open drop down list
      // selectaDom.find('.selecta-sel').off('click').on('click', function(e) {
      selectaDom.find('.selecta-sel').on('click', function(e) {
        if($(e.currentTarget).siblings('.selecta-list').is(':visible')) {
          $(e.currentTarget).siblings('.selecta-list').hide();
        } else {
          $(e.currentTarget).siblings('.selecta-list').show();
        }
      });


      // ==================
      // Remove
      selectaDom.find('.selecta-sel').on('click', 'span.label > span.glyphicon-remove', function(e) {
      // selectaDom.find('.selecta-sel span.glyphicon-remove').off('click').on('click', 'span.label > span.glyphicon-remove', function(e) {
        e.preventDefault();

        var el = $(this).siblings('span');
        var v = el.data('v');
        var t = el.text();

        var list = order[selIdx];
        order[selIdx] = list.filter( function ( obj ) {
          return (obj.v !== v && obj.t !== t);
        });

        var selecta_li = selectaDom.find('.selecta-list > li.selected[value="'+v+'"]');
        $.each(selecta_li, function ( idxLi, li ) {
          if($(li).html() === t) {
            $(li).removeClass('selected');
          }
        });


        var thisSel = $(selectaDom).find('.selecta-sel > li:first-child');
        thisSel.empty();
        $(order[selIdx]).each(function(_idx, i) {
          thisSel.append('<span class="label label-info"><span data-v="'+ i.v +'">'+ i.t +'</span><span class="glyphicon glyphicon-remove"></span></span>');
        });
        $(sel).data('selects', JSON.stringify(order[selIdx]));
        return false;
      });



      // ===================
      // Add new option from list

      $(selectaDom).find('.selecta-list > li').off('click').on('click', function(e) {
        var v = $(e.currentTarget).attr('value');
        var t = e.currentTarget.textContent;

        var idx = +$(e.currentTarget).parent().data('idx');
        if(order[idx] === undefined) {
          order[idx] = [];
        }

        var list = order[idx];
        var itm = list.find( function( obj ) { 
          return (obj.v === v && obj.t === t);
        });
        if(itm === undefined) {
          if(_self.multiple) {
            list.push({v: v, t: t});
          } else {
            order[idx] = [{v: v, t: t}];
            $(e.currentTarget).siblings('li').removeClass('selected');
          }
          $(e.currentTarget).addClass('selected'); 
        } else {
          order[idx] = list.filter( function(itmObj) {
            return (itmObj.v !== v && itmObj.t !== t);
          });
          $(e.currentTarget).removeClass('selected');
        }
        var el = $(selectaDom).find('.selecta-sel > li:first-child');
        el.empty();
        $(order[idx]).each(function(_idx, i) {
          el.append('<span class="label label-info"><span data-v="'+ i.v +'">'+ i.t +'</span><span class="glyphicon glyphicon-remove"></span></span>');
        });
        // Hide list
        clearTimeout(_self.dropDownListTimeout);
        $(e.currentTarget).parent().hide();

        $(sel).data('selects', JSON.stringify(order[idx]));
        // Show options from selecta list
        selectaDom.find('.selecta-list > li').show();
        // clear search box and focus
        selectaDom.find('.selecta-sel > li.selecta-search > input.selecta-search-input').focus().val('')
      });




      // =======
      selectaDom.find('.selecta-sel').on('focusout', 'li.selecta-search > input.selecta-search-input', function(e) {
        // Set timeout here so action click on dropdown list has chance to execute
        _self.dropDownListTimeout = setTimeout( function() {
          selectaDom.find('.selecta-list').hide();
        }, 500);
      });


    });
  };

}(jQuery));

