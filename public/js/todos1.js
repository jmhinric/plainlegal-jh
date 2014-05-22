$(function() {

  Parse.$ = jQuery;

  Parse.initialize("ttnsQFKq5KjSzJnUbXOS7QR52AUij0UXXL8m1XGr",
                   "tAHVSJMUjC0hwPuRHe7n9oM4xNBQzqQ7jCzfVUQ8");

  var Todo = Parse.Object.extend("Todo", {
    defaults: {
      content: "empty todo",
      done: false
    },

    initialize: function() {
      if (!this.get("content")) {
        this.set({"content": this.defaults.content});
      }
    },

    toggle: function() {
      this.save({done: !this.get("done")});
    }
  });

  var TodoCollection = Parse.Collection.extend({
    model: Todo
  });

  var TodoView = Parse.View.extend({
    tagName: "li",

    initialize: function() {
      this.listenTo(this.model, "change", this.render);
      this.render();
    },

    events: {
      "change input[type='checkbox']": "toggleDone",
      // Here I changed 'click span' to 'click .todo-destroy'
      "click .todo-destroy": "destroy"
    },

    render: function() {
      var template = $("#item-template").html();
      // Change 'this.model' to 'this.model.toJSON'???
      var rendered = _.template(template, { todo: this.model });
      this.$el.html(rendered);
    },

    toggleDone: function(e) {
      this.model.toggle();
      // var checked = $(e.target).is(":checked");
      // this.model.set('done', checked);
      // this.model.save();
    },

    destroy: function() {
      this.model.destroy();
      this.remove();
    }

  });

  var FormView = Parse.View.extend({
    el: ".content",

    events: {
      "keypress #new-todo": "createTodo"
    },

    createTodo: function(e) {
      if (e.keyCode != 13) return;
      // var todo_content = this.el.elements["new_todo"].value;
      this.collection.create({ content: this.input.val() });
      this.el.reset();
    }
  });

  var ListView = Parse.View.extend({
    // el: "ul",
    el: $("#todoapp"),

    initialize: function() {
      this.listenTo(this.collection, "add", this.addOne);
    },

    addOne: function(todo) {
      var view = new TodoView({model: todo});
      this.$el.append(view.el);
    }
  });

  var todos = new TodoCollection();
  var listView = new ListView({collection: todos});
  var formView = new FormView({collection: todos});
  Parse.history.start();
  // todos.fetch();
  
});