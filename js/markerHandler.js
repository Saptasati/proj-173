var userId = null

AFRAME.registerComponent("markerhandler", {
    init: async function () {

      if (userId === null) {
        this.askUserId();
      }
  
      //get the toys collection from firestore database
      var toys = await this.getToys();
  
      //markerFound event
      this.el.addEventListener("markerFound", () => {
        if(userId !== null) {
          var markerId = this.el.id;      
          this.handleMarkerFound(toys, markerId);
        }
        
      });
  
      //markerLost event
      this.el.addEventListener("markerLost", () => {
        this.handleMarkerLost();
      });
  
    },
    askUserId: function() {
      var iconUrl = "";
      swal({
        title: "Welcome to Toy Shop!!",
        icon: iconUrl,
        content: {
          element: "input",
          attributes: {
            placeholder: "Type your uid",
            type: "string",
            min:1
          }
        },
        closeOnClickOutside: false,
      }).then(inputValue => {
        userId = inputValue
      });
      
    },

    
        
       
    handleMarkerFound: function (toys, markerId) {
     
      var toy = toys.filter(toy => toy.id === markerId)[0];

      if (dish.is_out_of_stock === true) {
        swal({
          icon: "warning",
          title: toy.toy_name.toUpperCase(),
          text: "This toy is out of stock today!!!",
          timer: 2500,
          buttons: false
        });
      } else {
                 
      // Changing Model scale to initial scale
  
      var model = document.querySelector(`#model-${toy.id}`);
      model.setAttribute("position", toy.model_geometry.position);
      model.setAttribute("rotation", toy.model_geometry.rotation);
      model.setAttribute("scale", toy.model_geometry.scale);

      //Update UI conent VISIBILITY of AR scene(MODEL , DESCRIPTION & PRICE)
      model.setAttribute("visible",true);

      var descriptionContainer = document.querySelector(`#main-plane-${toy.id}`);
      descriptionContainer.setAttribute("visible", true);

      var pricePlane = document.querySelector(`#price-plane-${toy.id}`);
      pricePlane.setAttribute("visible", true)


       // Changing button div visibility
       var buttonDiv = document.getElementById("button-div");
       buttonDiv.style.display = "flex";
   
       var orderButton = document.getElementById("order-button");
       var orderSummaryButtton = document.getElementById("order-summary-button");
       var payButton = document.getElementById("pay-button")
       // Handling Click Events
       orderButton.addEventListener("click", function () {
        var uId;
         userId <= 9 ? (uId = `U0${userId}`) : `U${userId}`
         this.handleOrder(uId, toy);
         swal({
           icon: "warning",
           title: "Order Now",
           text: "Work In Progress"
         });
       });
   
       orderSummaryButtton.addEventListener("click", () => {
        this.handleOrderSummary();
       });
       payButton.addEventListener("click", () => this.handlePayment())
      }
    },
    handleOrder: function(uId, toy) {
      firebase
      .firestore()
      .collection("toys")
      .doc(uId)
      .get()
      .then(doc => {
        var details = doc.data();

        if(details["current_orders"][toy.id]) {
          details["current_orders"][toy.id]["quantity"] += 1;

          var currentQuantity = details["current_orders"][toy.id]["quantity"]
          details["current_orders"][toy.id]["subtotal"] =
            currentQuantity * toy.price
        } else {
          details["current_orders"][toy.id] = {
            item: toy.toy_name,
            price: toy.price,
            quantity: 1,
            subtotal: toy.price * 1
          }
        }
        details.total_bill += toy.price;
        firebase
        .firestore()
        .collection("users")
        .doc(doc.id)
        .update(details)
      })
    },
       //get the toys collection from firestore database
    getToys: async function () {
        return await firebase
          .firestore()
          .collection("toys")
          .get()
          .then(snap => {
            return snap.docs.map(doc => doc.data());
          });
    },
    getOrderSummary: async function (uId) {
      return await firebase
        .firestore()
        .collection("users")
        .doc(uId)
        .get()
        .then(doc => doc.data());
    },
    handleOrderSummary: async function () {

      //Getting User ID
      var uId;
      userId <= `U0${9}` ? (uId = `U0${userId}`) : `U${userId}`;
  
      //Getting Order Summary from database
      var orderSummary = await this.getOrderSummary(uId);
  
      //Changing modal div visibility
      var modalDiv = document.getElementById("modal-div");
      modalDiv.style.display = "flex";
  
      //Get the table element
      var tableBodyTag = document.getElementById("bill-table-body");
  
      //Removing old tr(table row) data
      tableBodyTag.innerHTML = "";
  
      //Get the cuurent_orders key 
      var currentOrders = Object.keys(orderSummary.current_orders);
  
      currentOrders.map(i => {
  
        //Create table row
        var tr = document.createElement("tr");
  
        //Create table cells/columns for ITEM NAME, PRICE, QUANTITY & TOTAL PRICE
        var item = document.createElement("td");
        var price = document.createElement("td");
        var quantity = document.createElement("td");
        var subtotal = document.createElement("td");
  
        //Add HTML content 
        item.innerHTML = orderSummary.current_orders[i].item;
  
        price.innerHTML = "$" + orderSummary.current_orders[i].price;
        price.setAttribute("class", "text-center");
  
        quantity.innerHTML = orderSummary.current_orders[i].quantity;
        quantity.setAttribute("class", "text-center");
  
        subtotal.innerHTML = "$" + orderSummary.current_orders[i].subtotal;
        subtotal.setAttribute("class", "text-center");
  
        //Append cells to the row
        tr.appendChild(item);
        tr.appendChild(price);
        tr.appendChild(quantity);
        tr.appendChild(subtotal);
  
        //Append row to the table
        tableBodyTag.appendChild(tr);
      });
  
      var totalTr = document.createElement("tr");

      var td1 = document.createElement("td");
      td1.setAttribute("class", "no-line");

      var td2 = document.createElement("td");
      td2.setAttribute("class", "no-line");

      var td3 = document.createElement("td");
      td3.setAttribute("class", "no-line text-center");

      var strongTag = document.createElement("strong");
      strongTag.innerHTML = "Total";

      td3.appendChild(strongTag);

      var td4 = document.createElement("td");
      td4.setAttribute("class", "no-line text-right");
      td4.innerHTML = "$" + orderSummary.total_bill;
  
      totalTr.appendChild(td1)
      totalTr.appendChild(td2)
      totalTr.appendChild(td3)
      totalTr.appendChild(td4)
      tableBodyTag.appendChild(totalTr)
  
    },
    handlePayment: function () {
  
      document.getElementById("modal-div").style.display = "none";
      
      var uId;
      userId <= `U0${9}` ? (uId = `U0${userId}`) : `U${userId}`;
  
      firebase
      .firestore()
      .collection("users")
      .doc(uId)
      .update({
        current_orders: {},
        id:{},
        total_bill: 0
      })
      .then(() => {
        swal({
          icon: "success",
          title: "Thanks for paying!",
          text: "We hope you like your toy!!",
          timer: 2500,
          buttons: false
        })
      })
  
    },
    handleRatings: async function (toy) {

     //Getting User ID
     var uId;
     userId <= `U0${9}` ? (uId = `U0${userId}`) : `U${userId}`;
      
      // Getting Order Summary from database
      var orderSummary = await this.getOrderSummary(uId);
  
      var currentOrders = Object.keys(orderSummary.current_orders);    
  
      if (currentOrders.length > 0 && currentOrders==toy.id) {
        
        // Close Modal
        document.getElementById("rating-modal-div").style.display = "flex";
        document.getElementById("rating-input").value = "0";
        document.getElementById("feedback-input").value = "";
  
        //Submit button click event
        var saveRatingButton = document.getElementById("save-rating-button");
  
        saveRatingButton.addEventListener("click", () => {
          document.getElementById("rating-modal-div").style.display = "none";
          //Get the input value(Review & Rating)
          var rating = document.getElementById("rating-input").value;
          var feedback = document.getElementById("feedback-input").value;
  
          //Update db
          firebase
            .firestore()
            .collection("toys")
            .doc(dish.id)
            .update({
              last_review: feedback,
              last_rating: rating
            })
            .then(() => {
              swal({
                icon: "success",
                title: "Thanks For Rating!",
                text: "We Hope You Like The Toys !!",
                timer: 2500,
                buttons: false
              });
            });
        });
      } else{
        swal({
          icon: "warning",
          title: "Oops!",
          text: "No toy found to give ratings!!",
          timer: 2500,
          buttons: false
        });
      }
  
    },

  
    handleMarkerLost: function () {
      // Changing button div visibility
      var buttonDiv = document.getElementById("button-div");
      buttonDiv.style.display = "none";
    },
 
  });
  