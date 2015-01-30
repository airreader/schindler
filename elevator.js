{
  init: function(elevators, floors) {
    //var fCtrl = new FloorsController();
    var floorsObject= {};
    floors.forEach(function(floor) {
      var floorNum = floor.floorNum();
      floorsObject[floorNum] = floor;
      new FloorController(floor);
    });
    var eCtrl = new ElevatorController(floorsObject, elevators[0]);
    //var eCtrl1 = new ElevatorController(floorsObject, elevators[1]);
    //var eCtrl2 = new ElevatorController(floorsObject, elevators[2]);
    //var eCtrl3 = new ElevatorController(floorsObject, elevators[3]);
    console.log(floorsObject);

    function FloorController(floor) {
      var floor = floor;
      floor.on("up_button_pressed", function() {
        eCtrl.moveToNextByFloorButton(floor.floorNum());
      });
      floor.on("down_button_pressed", function() {
        eCtrl.moveToNextByFloorButton(floor.floorNum());
      });
    }

    function ElevatorController(floorsObject, elevator) {
      var elevator = elevator;
      var direction = "stop";
      var self = this;

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
        if(force) {
          elevator.goToFloor(moveTo, true);
        } else {
          elevator.goToFloor(moveTo);
        }
      }

      this.moveToNext = function(next) {
        //var next = floorsCtrl.getNearCalledFloor(elevator.currentFloor());
        self.setDirection(next);
        //elevator.goToFloor(next);
      }

      this.moveToNextByFloorButton = function(next) {
        if(direction === "stop") {
          self.setDirection(next);
        }
      } 

      this.checkNext = function() {
        var next;
        var pressedFloors = elevator.getPressedFloors();
        if(!pressedFloors.length) { return; }
        console.log(pressedFloors);
        console.log(direction);
        //downで1階に入って3、4階が押された場合、4、3と到着してしまう
        if(direction === "up") {
          next = Math.min.apply(null, pressedFloors);
        } else {
          next = Math.max.apply(null, pressedFloors);
        }
        console.log(next);
        return next;
      }

      elevator.on("idle", function() {
        elevator.goingUpIndicator(true);
        elevator.goingDownIndicator(true);
        self.setDirection(elevator.currentFloor());
        //elevator.goToFloor(elevator.currentFloor());
      });

      elevator.on("floor_button_pressed", function(floorNum) {
        //elevator.destinationQueue.push(floorNum);
        //reserveFloor.push(floorNum);
      });

      elevator.on("stopped_at_floor", function(floorNum) {
        var pressedFloors = elevator.getPressedFloors();
        //elevator.destinationQueue.push(floorNum);
        if(pressedFloors.length) {
          self.setDirection(self.checkNext());
        } else {
          var temp;
          var index;
          for(i=0;i<floorsObject.length;i++) {
            if(floorsObject[i].buttonStates.up === "activated" || floorsObject[i].buttonStates.down === "activated") {
              if(!temp) {
                temp = Math.abs(floorNum-i);
                index = i;
              } else if(Math.abs(floorNum-i) < temp){
                temp = Math.abs(floorNum-i);
                index = i;
              }
            }
          }
          self.moveToNextByFloorButton(i);
        }
      });

      elevator.on("passing_floor", function(floorNum, d) {
        direction = d;
        if(d === "up") {
          if(floorsObject[floorNum+1].buttonStates.up === "activated") {
            self.setDirection(floorNum+1, true);
            //elevator.goToFloor(floorNum, true);
          }
        } else {
          if(floorsObject[floorNum-1].buttonStates.down === "activated") {
            self.setDirection(floorNum-1, true);
            //elevator.goToFloor(floorNum, true);
          }
        }
      });
    }
  },
  update: function(dt, elevators, floors) {
      // We normally don't need to do anything here
  }
}


