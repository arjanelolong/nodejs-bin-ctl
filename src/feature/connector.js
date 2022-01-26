import API from "../library/api.js";
import R from 'ramda';

export default async(params) => {
    const feature = "connector";
    const { connectors, spaceId } = params;
    const existingConnectors = await (await API.action.find({spaceId, feature})).data;

    await Promise.all(
        connectors.map(async (connector) => {
            const existingConnector = R.find(R.propEq('name', connector.name), existingConnectors);

            if(existingConnector){
                try{
                    const updated = await API.action.update({
                        spaceId,
                        data: R.omit(["connector_type_id"], connector),
                        id: existingConnector.id,
                        feature,
                    });
                    if(updated){
                        console.log(`updated connector "${connector.name}"`);
                    }
                    // console.log('updated');
                }catch(e){
                    throw Error(e.response.data.message);
                };
            }else{
                try{
                    const added = await API.action.create({ 
                        spaceId, 
                        data: R.omit(['id',], connector),
                        id: connector.id,
                        feature,
                    });

                    if(added){
                        console.log(`added connector "${connector.name}"`);
                    }
                    // console.log(added);
                }catch(e){
                    throw Error(e.response.data.message);
                }
            }
        }),
    );

    if(existingConnectors){
        await Promise.all(
            existingConnectors.map(async (existingConnector) => {
                const connector = R.find(R.propEq('name', existingConnector.name), connectors);
                if(!existingConnector.preconfigured && !connector){
                    try{
                        const deleted = await API.action.delete({spaceId, id: existingConnector.id, feature});
                        if(deleted){
                            console.log(`deleted connector "${existingConnector.name}"`);
                        }
                        // console.log(deleted);
                    }catch(e){
                        throw Error(e.response.data.message);
                    }
                }
            }),
        );
    }
}