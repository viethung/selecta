(function($) {
  // function db() {
  //   for(var a in arguments) {
  //     window.console.log(arguments[a]);
  //   }
  // }
  function SelectaClass(element) {
    this.el             = element; // element this plugin bind to
    this.orderedValues  = [];      // selected values
    this.originalValues = [];      // array of value and text object from select
  }

  SelectaClass.prototype.get = function() {
    return this.orderedValues;
  };

  SelectaClass.prototype.set = function() {
    var values = [].join.call(arguments, ':'); // turn arguments into array
    this.orderedValues = this.originalValues.filter(function(i) {
      return (values.indexOf(i.value) >= 0);
    });
    this.redrawDisplayBoxes();

    // redraw selected in list
    this.redrawSelectedList();
  };

  SelectaClass.prototype.redrawDisplayBoxes = function() {
    var displayBoxesHtml = '';
    $(this.orderedValues).each(function(_idx, ov) {
      displayBoxesHtml += '<span class="label label-info"><span data-v="'+ ov.value +'">'+ ov.text +'</span><span class="glyphicon glyphicon-remove"></span></span>';
    });
    // Redraw display boxes - show html
    $(this.el)
      .next('.selecta-sel')
      .find('> li:first-child')
      .empty()
      .append(displayBoxesHtml);
  };

  SelectaClass.prototype.redrawSelectedList = function() {
    var listbox = $(this.el).next('.selecta-sel').find('.selecta-list');

    // clear all selected and show them all
    listbox
      .find('li')
      .removeClass('selected')
      .show();

    var liItems = [];
    $(this.orderedValues).each(function(_idx, ov) {
      liItems.push('li[data-v="'+ ov.value +'"]');
    });
    listbox
      .find(liItems.join(','))
      .addClass('selected');
  };

  SelectaClass.prototype.init = function() {
    var _self = this;
    var list = '';
    $.each(this.el, function(selIdx, sel) {
      list += '<li data-v="'+$(sel).val()+'">'+$(sel).html()+'</li>';
      _self.originalValues.push({value: $(sel).val(), text: $(sel).html()});
    });


    // Prepare dom and display
    $(this.el)
      .hide()
      .after(
        '<ul class="selecta-sel">' + 
          '<li></li>' +
          '<li class="selecta-search">' +
            '<input class="selecta-search-input" placeholder="Enter text to filter list">' + 
            '<ul class="selecta-list">'+list+'</ul>' +
          '</li>' + 
        '</ul>'
        
      );


    // Event: click on drop down list, add/remove selected
    $(this.el)
      .siblings('.selecta-sel')
      .find('ul.selecta-list > li')
      .off('click')
      .on('click', function() {
        $(this)
          .toggleClass('selected')
          .parent().hide();

        var v = $(this).data('v');
        var t = $(this).html();

        if($(this).hasClass('selected')) { //add
          _self.orderedValues.push({ value: v, text: t });
        } else { //remove
          _self.orderedValues = _self.orderedValues.filter( function ( obj ) {
            return (obj.value !== v && obj.text !== t);
          });
        }

        _self.redrawDisplayBoxes();

        // Clear search box
        $(this)
          .closest('.selecta-sel')
          .find('input.selecta-search-input')
          .val('');

        //Reset drop down list - Show all options
        $(_self.el)
          .siblings('.selecta-sel')
          .find('.selecta-list > li').show();
      });



    // Event: focus on search box, display drop down list
    $(this.el)
      .siblings('.selecta-sel')
      .find('input.selecta-search-input')
      .off('focus')
      .on('focus', function() {
        $('.selecta-list').hide();
        var listbox = $(this).siblings('.selecta-list');
        if(listbox.is(':visible')) {
          listbox.hide();
        } else {
          listbox.show();
        }
      })
      // close drop down list if lost focus
      .on('focusout', function() {
        var listbox = $(this).siblings('.selecta-list');
        // Set timeout here so action click on dropdown list has chance to execute
        _self.dropDownListTimeout = setTimeout( function() {
          listbox.hide();
        }, 500);
      })
      .off('keyup')
      .on('keyup', function(e) {
        var t = $(this).val();
        if(t.length === 0 && e.key === "Backspace") {
          var delItem = _self.orderedValues.pop();

          // Redraw display boxes
          _self.redrawDisplayBoxes();

          // Un-tick selected item from drop down list
          var selecta_li = $(_self.el)
                            .siblings('.selecta-sel')
                            .find('.selecta-list > li.selected[data-v="'+delItem.value+'"]');
          $.each(selecta_li, function ( idxLi, li ) {
            if($(li).html() === delItem.text) {
              $(li).removeClass('selected');
            }
          });

        } else { // filter drop down list
          // filter select list
          $(_self.el)
              .siblings('.selecta-sel')
              .find('.selecta-list > li')
              .each( function () {
                if($(this).text().toUpperCase().search(t.toUpperCase()) === -1) {
                  $(this).hide();
                } else {
                  $(this).show();
                }
              });
        }

      });


    // Event: remove box by click on x
    $(this.el)
      .siblings('.selecta-sel')
      .on('click', 'span.label > span.glyphicon-remove', function(e) {
        e.stopPropagation();

        var el = $(this).siblings('span');
        var v = el.data('v');
        var t = el.text();

        // remove value
        _self.orderedValues = _self.orderedValues.filter( function ( obj ) {
          return (obj.value !== v && obj.text !== t);
        });

        // Redraw display boxes
        this.redrawDisplayBoxes();

        // Un-tick selected item from drop down list
        var selecta_li = $(_self.el)
                          .siblings('.selecta-sel')
                          .find('.selecta-list > li.selected[data-v="'+v+'"]');
        $.each(selecta_li, function ( idxLi, li ) {
          if($(li).html() === t) {
            $(li).removeClass('selected');
          }
        });

      });
  };

  $.fn.selecta = function() {
    return this.each(function() {
      var instance = $(this).data('selecta');
      if (!instance) {
        instance = new SelectaClass(this);
        $(this).data('selecta', instance);
      }
      instance.init.apply(instance, arguments);
    });
  };
}(jQuery));