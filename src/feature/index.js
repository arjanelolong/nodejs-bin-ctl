import API from "../library/api";
import R from 'ramda';
import { v4 as uuidv4 } from 'uuid';

export default async(params) => {
    const feature = "index";
    const { indexes, spaceId } = params;
    const existingindexes = await (await API.action.find({spaceId, feature})).data.data;

    /**  
     * update existing
     * add new indexes 
    */
    await Promise.all(
        indexes.map(async (index) => {
            const existingIndex = R.find(R.propEq('name', index.name), existingindexes);

            if(existingIndex){
                try{
                    const updated = await API.action.update({
                        spaceId,
                        data: R.omit(['consumer'], index),
                        id: existingIndex.id,
                        feature,
                    });
                    if(updated){
                        console.log(`updated index "${index.name}"`);
                    }
                    // console.log('updated');
                }catch(e){
                    throw Error(e.response.data.message);
                };
            }else{
                try{
                    const added = await API.action.create({ 
                        spaceId, 
                        data: index,
                        id: uuidv4(),
                        feature,
                    });

                    if(added){
                        console.log(`added index "${index.name}"`);
                    }
                    // console.log(added);
                }catch(e){
                    throw Error(e.response.data.message);
                }
            }
        }),
    );

    /** delete existing that is not on definition file */
    if(existingindexes){
        await Promise.all(
            existingindexes.map(async (existingIndex) => {
                const index = R.find(R.propEq('name', existingIndex.name), indexes);
                if(!index){
                    try{
                        const deleted = await API.action.delete({spaceId, id: existingIndex.id, feature});
                        if(deleted){
                            console.log(`deleted index "${existingIndex.name}"`);
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