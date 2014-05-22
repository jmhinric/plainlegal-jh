$(function() {

  var Todo = Backbone.Model.extend({
    defaults: function() {
      return {
        title: "empty todo",
        order: Todos.nextOrder(),
        done: false
      };
    },

    toggle: function() {
      this.save({ done: !this.get("done") });
    }

  });

  var TodoList = Backbone.Collection.extend({
    model: Todo,




  });

});