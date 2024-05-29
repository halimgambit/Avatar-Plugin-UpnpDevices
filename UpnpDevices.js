exports.action = function(data, callback){

	let client = setClient(data);
	info("UpnpDevices from:", data.client, "To:", client);
	discoverDevice (data, client);
	callback();
 
}
		
const upnp = require('node-upnp-utils');

function discoverDevice(data, client) {
    upnp.startDiscovery();

    Avatar.speak('Scanne en cours !', client, () => {});

    setTimeout(() => {
        upnp.stopDiscovery(() => {
            let device_list = upnp.getActiveDeviceList();
            if (device_list.length === 0) {
                Avatar.speak('Aucun appareil n\'a été trouvé', client, () => {
                    Avatar.Speech.end(client);
                });
            } else if (device_list.length === 1) {
                Avatar.speak(`${device_list.length} appareil a été trouvé`, client, () => {
                    main(device_list, data, client);
                    Avatar.Speech.end(client);
                });
            } else {
                Avatar.speak(`${device_list.length} appareils ont été trouvés`, client, () => {
                    main(device_list, data, client);
                    Avatar.Speech.end(client);
                });
            }
        });
    }, 2000);
}

async function main(device_list, data, client) {
    let i = 0;
    function loop() {
        if (i < device_list.length) {
            let device = device_list[i];
            let ip = device['address'];
            let description = device['description'];
            if (description && description['device']) {
                let name = description['device']['friendlyName'];
                info(`${name} à l'adresse ip: ${ip}`);
                Avatar.speak(`${name} avec l'adresse ip: ${ip}`, data.client, () => {
                    i++;
                    setTimeout(loop, 2000);
                });
            } else {
                i++;
                setTimeout(loop, 2000);
            }
        } else {
            Avatar.Speech.end(client);
        }
    }

    loop();
}

function setClient(data){
    let client = data.client;
    if (data.action.room)
    client = (data.action.room != 'current') ? data.action.room : (Avatar.currentRoom) ? Avatar.currentRoom : Config.default.client;
    if (data.action.setRoom)
    client = data.action.setRoom;
    return client;
}