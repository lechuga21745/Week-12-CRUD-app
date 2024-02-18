class House {
    constructor(name) {
        this.name = name;
        this.room = [];
    }
// adds a new room +name +area to this.room []
    addRoom(name, area) {
        this.rooms.push(new Room(name,area));
    }
}

class Room {
    constructor(name, area) {
        this.name = name;
        this.area = area;
    }
}
// how the http requests are sent
class HouseService {
    //this is how we get the API that we used involved
    static url = 'https://ancient-taiga-31359.herokuapp.com/api/houses';

    // these statics are where all our functions are going to come from. (add,delete,gethouses etc)
    static getAllHouses () {
        return $.get(this.url);
    }

    static getHouse(id) {
        return $.get(this.url + `/${id}`);
    }

    static createHouse(house) {
        return $.post(this.url, house);
    }
// this is when we have to update a class
    static updateHouse(house) {
        return $.ajax({
            url: this.url + `/${house._id}`,
            dataType: 'json',
            data: JSON.stringify(house),
            contentType: 'application/json',
            type: 'PUT'
        });
    }
// this line tells the api to delete the house usng the id
static deleteHouse(id) {
    return $.ajax({
        url: this.url + `/${id}`,
        type: 'DELETE'
    });
  }  
}
// this is where all the houses are rendered to the DOM
class DOMManager {
    static houses;

    static getAllHouses() {
        HouseService.getAllHouses().then(houses => this.render(houses));
    }

    static createHouse(name) {
        HouseService.createHouse(new House(name))
        .then(() => {
            return HouseService.getAllHouses();
        })
        .then((houses) => this.render(houses));
    }
// this is how we delete a house it takes one parameter compared to delete room or other statics
//house servce we put the id in which w want to delete the house
// return houseService is for when we delete a house, we can refresh the page and retrieve the other houses that exist. 
    static deleteHouse(id) {
        HouseService.deleteHouse(id)
        .then(() => {
            return HouseService.getAllHouses();
        })
        .then((houses) => this.render(houses));
    }
    //pushes new room to the array of rooms
    static addRoom(id) {
        for (let house of this.houses) {
            if (house._id == id) {
                house.rooms.push(new Room($(`#${house._id}-room-name`).val(), $(`#${house._id}-room-area`).val()));
                HouseService.updateHouse(house)
                .then(() => {
                    return HouseService.getAllHouses();
                })   
                .then((houses) => this.render(houses));
            }
        }
    }
//this is where we delete the rooms out of a particular house
//we make suure that the houuse._id matches the house id we want to delete a room from. 
    static deleteRoom(houseId, roomId) {
        for (let house of this.houses) {
            if (house._id == houseId) {
                for (let room of house.rooms) {
                    if (room._id == roomId) {
                        house.rooms.splice(house.rooms.indexOf(room), 1);
                        HouseService.updateHouse(house)
                        .then(() => {
                            return HouseService.getAllHouses();
                        })
                        .then((houses) => this.render(houses));
                    }
                }
            }
        }
    }
//with the render, we are able to refresh the page and still retrieve the information for the houses after deleting or addng a room/house
    static render(houses) {
        this.houses = houses;
        $('#app').empty();
        for (let house of houses) {
           //newest house appears at the top
            $('#app').prepend(
                //given the card bootstrap
                `<div id="${house._id}" class = "card">
                    <div class="card-header">
                        <h2>${house.name}</h2>
                        <button class= "btn btn-danger" onclick="DOMManager.deleteHouse('${house._id}')">Delete</button>
                </div>
                <div class ="card-body">
                    <div class ="card">
                        <div class ="row">
                            <div class ="col-sm">
                                <input type="text" id="${house._id}-room-name" class = "form-control" placeholder="Room Name">
                            </div>
                            <div class ="col-sm">
                                <input type="text" id="${house._id}-room-area" class = "form-control" placeholder="Room Area">
                            </div>
                        </div>
                        <button id="${house._id}-new-room" onclick="DOMManager.addRoom('${house._id}')" class="btn btn-primary form-control">Add</button>
                    </div>
                </div>
            </div><br>` 
                //line 70: this is where the house's name is going to popup 
            );
            //renders each room of houses
            for (let room of house.rooms) {
                $(`#${house._id}`).find('.card-body').append(
                    `<p>
                    <span id="name-${room._id}"><strong>Name: </strong> ${room.name}</span>
                    <span id="area-${room._id}"><strong>Area: </strong> ${room.area}</span>
                    <button class="btn btn-danger" onclick="DOMManager.deleteRoom('${house._id}', '${room._id}')">Delete Room</button>`
                );

            }
        }
    }

}

$('#create-new-house').click(() => {
    DOMManager.createHouse($('#new-house-name').val());
    $('#new-house-name').val('');
});
// this runs the previous lines.
DOMManager.getAllHouses();

