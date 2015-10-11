{
  init: function(elevators, floors) {
    var fCtrl = new FloorController(floors);
    floors.forEach(function(floor) {
      floor.on("up_button_pressed", function() {
        fCtrl.updateButtonPressed();
      });
      floor.on("down_button_pressed", function() {
        fCtrl.updateButtonPressed();
      })
    });

    elevators.forEach(function(elevator) {
      new ElevatorController(fCtrl, elevator);
    })

    function FloorController(floors) {
      var topFloor = floors.length - 1;
      var upButtonPressedFloorList = [];
      var downButtonPressedFloorList = [];
      this.updateButtonPressed = function() {
        upButtonPressedFloorList = floors.map(upPressedFloorList).filter(function(e) { return e !== null });
        downButtonPressedFloorList = floors.map(downPressedFloorList).filter(function(e) { return e !== null });
      }

      this.getUpButtonPressedFloorList = function() {
        return upButtonPressedFloorList;
      }

      this.getDownButtonPressedFloorList = function() {
        return downButtonPressedFloorList;
      }

      this.getTopFloor = function() {
        return topFloor;
      }

      function upPressedFloorList(floor) {
        if(floor.buttonStates.up === "activated") {
          return floor.level;
        }
        return null;
      }

      function downPressedFloorList(floor) {
        if(floor.buttonStates.down === "activated") {
          return floor.level;
        }
        return null;
      }
    }

    function ElevatorController(FloorController, elevator) {
      var elevator = elevator;
      var direction = "stop";
      var self = this;
      var maxLoadFactor = 0.5;

      this.setDirection = function(moveTo, force) {
        if(elevator.currentFloor() > moveTo) {
          direction = "down";
          elevator.goingUpIndicator(false);
          elevator.goingDownIndicator(true);
        } else if(elevator.currentFloor() < moveTo) {
          direction = "up";
          elevator.goingUpIndicator(true);
          elevator.goingDownIndicator(false);                   
        } else {
          direction = "stop";
          elevator.goingUpIndicator(true);
          elevator.goingDownIndicator(true);
        }
          elevator.goToFloor(moveTo, true);
      }

      this.checkNext = function() {
        var next;
        var list = [];
        if(direction === "up") {
          if(elevator.loadFactor() < maxLoadFactor) {
            list = FloorController.getUpButtonPressedFloorList();
          }
          Array.prototype.push.apply(list, elevator.getPressedFloors());
          list = list.filter(function(e) { return e > elevator.currentFloor() });
          list = list.filter(function (x, i, self) {
            return self.indexOf(x) === i;
          });
          if(list.indexOf(elevator.currentFloor()) >= 0) {
            list.splice(list.indexOf(elevator.currentFloor()), 1);
          }
          next = Math.min.apply(null, list);
        } else if(direction === "down") {
          if(elevator.loadFactor() < maxLoadFactor) {
            list = FloorController.getDownButtonPressedFloorList();
          }
          Array.prototype.push.apply(list, elevator.getPressedFloors());
          list = list.filter(function(e) { return e < elevator.currentFloor() });
          list = list.filter(function (x, i, self) {
            return self.indexOf(x) === i;
          });
          if(list.indexOf(elevator.currentFloor()) >= 0) {
            list.splice(list.indexOf(elevator.currentFloor()), 1);
          }
          next = Math.max.apply(null, list);
        } else {
          next = this.getNearCalledFloor();
        }
        return next;
      }

      this.getNearCalledFloor = function() {
          var list = [];
          if(elevator.loadFactor() < maxLoadFactor) {
            list = FloorController.getUpButtonPressedFloorList();
            Array.prototype.push.apply(list, FloorController.getDownButtonPressedFloorList());
          }
          Array.prototype.push.apply(list, elevator.getPressedFloors());
          list = list.filter(function (x, i, self) {
            return self.indexOf(x) === i;
          });
          if(elevator.loadFactor() !== 0) {
            if(list.indexOf(elevator.currentFloor()) >= 0) {
              list.splice(list.indexOf(elevator.currentFloor()), 1);
            }
          }
          return getClosestNum(elevator.currentFloor(), list);
      }

      elevator.on("idle", function() {
        self.setDirection(self.getNearCalledFloor());
      });

      elevator.on("floor_button_pressed", function(floorNum) {
      });

      elevator.on("stopped_at_floor", function(floorNum) {
        var pressedFloors = elevator.getPressedFloors();

        if(floorNum === FloorController.getTopFloor()) {
          elevator.goingUpIndicator(false);
          elevator.goingDownIndicator(true);
        } else if(floorNum === 0) {
          elevator.goingUpIndicator(true);
          elevator.goingDownIndicator(false);
        }
        //elevator.destinationQueue.push(floorNum);
        if(isFinite(self.checkNext())) {
          self.setDirection(self.checkNext());
        } else {
          self.setDirection(self.getNearCalledFloor());
        }
      });

      elevator.on("passing_floor", function(floorNum, d) {
        direction = d;
        FloorController.updateButtonPressed();
        if(isFinite(self.checkNext())) {
          self.setDirection(self.checkNext());
        } else {
          if(direction === "up") {
            self.setDirection(Math.max.apply(null,FloorController.getDownButtonPressedFloorList()));
          } else {
            self.setDirection(Math.min.apply(null,FloorController.getUpButtonPressedFloorList()));
          }
        }
      });

    }

    function getClosestNum(num, ar){
       var closest;
       if(Object.prototype.toString.call(ar) ==='[object Array]' && ar.length>0){
         closest = ar[0];
         for(var i=0;i<ar.length;i++){ 
            var closestDiff = Math.abs(num - closest);
            var currentDiff = Math.abs(num - ar[i]);
            if(currentDiff < closestDiff){
                closest = ar[i];
            }
          }
          return closest;
        }
     return false;
    }
  },
  update: function(dt, elevators, floors) {
        // We normally don't need to do anything here
  }
}
