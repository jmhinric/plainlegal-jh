$(function() {

  Parse.$ = jQuery;

  Parse.initialize("ttnsQFKq5KjSzJnUbXOS7QR52AUij0UXXL8m1XGr",
    "tAHVSJMUjC0hwPuRHe7n9oM4xNBQzqQ7jCzfVUQ8");

  // Todo Model
  // ==============================================

  var Todo = Parse.Object.extend("Todo", {
    // Default attributes for the todo.
    defaults: {
      content: "empty todo...",
      done: false
    },

    // Ensure that each todo created has 'content'.
    initialize: function() {
      if (!this.get("content")) {
        this.set({"content": this.defaults.content});
      }
    },

    // Toggle the 'done' state of this todo item.
    toggle: function() {
      this.save({done: !this.get("done")});
    }
  });

  // Todo Collection
  // ==============================================

  var TodoList = Parse.Collection.extend({

    // Reference to this collection's model.
    model: Todo
  });

  // Todo Item View
  // ===============================================

  // The DOM element for a todo item...
  var TodoView = Parse.View.extend({

    //... is a list tag.
    tagName:  "li",

    // Cache the template function for a single item.
    template: _.template($('#item-template').html()),

    // The DOM events specific to an item.
    events: {
      "click .toggle"       : "toggleDone",
      "click .todo-destroy" : "clear"
    },

    // The TodoView listens for changes to its model, re-rendering. Since there's
    // a one-to-one correspondence between a Todo and a TodoView in this
    // app, we set a direct reference on the model for convenience.
    initialize: function() {
      _.bindAll(this, 'render', 'remove');
      this.model.bind('change', this.render);
      this.model.bind('destroy', this.remove);
    },

    // Re-render the contents of the todo item.
    render: function() {
      $(this.el).html(this.template(this.model.toJSON()));
      // this.input = this.$('.edit');
      return this;
    },

    // Toggle the "done" state of the model.
    toggleDone: function(e) {
      $(e.target).siblings("label").toggleClass("completed");
      this.model.toggle();
    },

    // Remove the item, destroy the model.
    clear: function() {
      this.model.destroy();
    }

  });

  // The Application
  // ===============================================


  // The main view that lets a user manage their todo items
  var ManageTodosView = Parse.View.extend({

    // Delegated events for creating new items, and clearing completed ones.
    events: {
      "keypress #new-todo":  "createOnEnter"
    },

    el: ".content",

    // At initialization we bind to the relevant events on the 'Todos'
    // collection, when items are added or changed. Kick things off by
    // loading any preexisting todos that might be saved to Parse.
    initialize: function() {

      _.bindAll(this, 'addOne', 'addAll', 'createOnEnter');

      // Main todo management template
      this.$el.html(_.template($("#manage-todos-template").html()));
      
      this.input = this.$("#new-todo");

      // Create our collection of Todos
      this.todos = new TodoList;

      // Setup the query for the collection to look for todos
      this.todos.query = new Parse.Query(Todo);
        
      this.todos.bind('add',     this.addOne);
      this.todos.bind('reset',   this.addAll);
      this.todos.bind('all',     this.render);

      this.todos.fetch();
    },

    // Add a single todo item to the list by creating a view for it, and
    // appending its element to the '<ul>'.
    addOne: function(todo) {
      var view = new TodoView({model: todo});
      this.$("#todo-list").append(view.render().el);
    },

    // Add all items in the Todos collection at once.
    addAll: function(collection, filter) {
      this.$("#todo-list").html("");
      this.todos.each(this.addOne);
    },

    // If you hit return in the main input field, create new Todo model
    createOnEnter: function(e) {
      if (e.keyCode != 13) return;
      
      $(".message").text("");
      
      var newTodo = this.input.val();
      var alreadyExists = false;
      
      this.todos.forEach(function(todo) {
        if (newTodo === todo["attributes"].content && todo["attributes"].done === true) {
          $(".message").text("You've already done that!");
          alreadyExists = true;
        }
      });

      if (alreadyExists) {
        this.input.val('');
        return;
      }

      this.todos.create({
        content: this.input.val(),
        done:    false,
      });

      this.input.val('');
    },
  });

  
  // The main view for the app
  // ==========================================

  var AppView = Parse.View.extend({
    el: $("#todoapp"),

    initialize: function() {
      this.render();
    },

    render: function() {
      new ManageTodosView();
    }
  });

  new AppView;
});