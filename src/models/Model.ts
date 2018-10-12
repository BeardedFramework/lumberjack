import db from '../database/db'
import Objects from '../helpers/Objects'
import queryBuilder from '../database/queryBuilder'
import Logger from '@beardedframework/logger'
import DatetimeService  from '../services/DatetimeService'

export default class Model extends queryBuilder{

  public table : string = '';

  public fillable : Array<string> = [];
  
  public hidden : Array<string> = [];

  public data : any;

  private fields : Array<string> = [];

  private DatetimeValues : Array<string> = ['created_at', 'updated_at', 'deleted_at', 'last_login'];

  //public static table : string = '';

  /*
   *
   * class construtor
   *
   * */
  constructor(data : any = {}){

    super();
    this.data = data;
    this.columns()
  }

  /*
   * Save a model instance on database
   *
   * @return Promise
   *
   * */
  public async save() : Promise<any> {

    if(this.data.hasOwnProperty('id')){
    
      return db.Instance.update(this);
    }
    else{

      Logger.info( 'should fill need hide fields');    
      this.fillHiddenValuesEmptyOnNewElement();
      return db.Instance.save(this)
    }
  }

  /*
   * used to fill hidden values empty on new elements
   *
   * @return void
   *
   * */
  private fillHiddenValuesEmptyOnNewElement() : void{

    for(let valueAsKey of this.hidden){

      if(this.data.hasOwnProperty(valueAsKey))
        continue;
      
      let el = {}
      el[valueAsKey] = 'valueaskey';
      this.data = Object.assign(this.data, el);
    }
  }

  /*
   * parse the model to json
   *
   * @return json
   *
   * */
  public toJson() : object{

    let self = this;
    let resp = Objects.map(this.data, function(value, key){

      if(!Objects.inArray(self.hidden, key)){

        if(self.DatetimeValues.indexOf(key) > -1)
          return DatetimeService.formatter(value); 
      
        return value;
      }
    });

    return resp
  }
  /*
   * parse to array
   *
   * @return Array
   *
   * */
  public toArray() : Array<any> {

    let resp = Objects.mapToArray(this.data, function(value, key){

      //console.log(key);
      return value;
    });

    return resp
  }

  /*
   * get the columns of the table
   *
   *
   * @return void
   *
   * */
  private async columns () : Promise<any>{

    const cols = await db.Instance.columns(this);
    this.fields = cols;
  }

  /*
   * has many
   *
   * @return Oject otherModel
   * @return string otherIndex
   * @return string myIndex
   *
   * @return collection
   *
   * */
  protected async hasManyToMany(
    otherModel, pivotTable : string, otherPivot : string, myPivot : string, otherIndex : string = 'id', myIndex : string = 'id'){
    
    //let builder = new queryBuilder(pivotTable)

    let otherInstance = new otherModel(); 
    let data = await otherModel.select(`${otherInstance.table}.*`)
      .where(`${pivotTable}.${myPivot}`,'=', `${this.data[myIndex]}`)
      .join(`${pivotTable}`, `${pivotTable}.${otherPivot}`,'=', `${otherInstance.table}.${otherIndex}`)
      .get();

    this.data[`${otherInstance.constructor.name.toLowerCase()}`] = data.toJson();
    return data;
  }

  /*
   * has many
   *
   * @return Oject otherModel
   * @return string otherIndex
   * @return string myIndex
   *
   * @return collection
   *
   * */
  protected async hasMany(otherModel, otherIndex : string, myIndex :string){
  
  
    let instance = new otherModel();
    let data = await otherModel.select('*')
    //.leftJoin(this.table, `${this.table}.${myIndex}`, '=', `${instance.table}.${otherIndex}`)
      .where(`${instance.table}.${otherIndex}`,'=', `${this.data[myIndex]}`)
      .get();
    //this.data.${name} = data.toArray();
    this.data[`${instance.constructor.name.toLowerCase()}`] = data.toJson();
    return data;
  }

  /*
   * get belongs to many
   *
   * @return Oject otherModel
   * @return string otherIndex
   * @return string myIndex
   *
   * @return collection
   *
   * */
  protected async belongsToMany(otherModel, otherIndex : string, myIndex :string,){
  
    let instance = new otherModel();
    let data = await otherModel.select('*')
    //.leftJoin(this.table, `${this.table}.${myIndex}`, '=', `${instance.table}.${otherIndex}`)
      .where(`${instance.table}.${otherIndex}`,'=', `${this.data.id}`)
      .get();
    //this.data.${name} = data.toArray();
    this.data[`${instance.constructor.name.toLowerCase()}`] = data.toJson();
    return data;
  }
  /*
   * get the one relation
   *
   * @return Oject otherModel
   * @return string otherIndex
   * @return string myIndex
   *
   * @return collection
   *
   * */
  protected async belongsTo(otherModel, otherIndex : string, myIndex :string,){
  
    let instance = new otherModel();
    let data = await otherModel.select('*')
    //.leftJoin(this.table, `${this.table}.${myIndex}`, '=', `${instance.table}.${otherIndex}`)
      .where(`${instance.table}.${otherIndex}`,'=', `${this.data.id}`)
      .first();
    //this.data.${name} = data.toArray();
    this.data[`${instance.constructor.name.toLowerCase()}`] = data.toJson();
    return data;
  }

  /*
   * get the one relation
   *
   * @return Oject otherModel
   * @return string otherIndex
   * @return string myIndex
   *
   * @return collection
   *
   * */
  protected async hasOne(otherModel, otherIndex : string, myIndex :string){
  
  
    let instance = new otherModel();
    let data = await otherModel.select('*')
    //.leftJoin(this.table, `${this.table}.${myIndex}`, '=', `${instance.table}.${otherIndex}`)
      .where(`${instance.table}.${otherIndex}`,'=', `${this.data[myIndex]}`)
      .first();
    //this.data.${name} = data.toArray();
    this.data[`${instance.constructor.name.toLowerCase()}`] = data.toJson();
    return data;
  }

  /*
   * create a new instance of the model
   *
   * @param Object data
   *
   * @return instance
   *
   * */
  public static create (data : any){

    return new this(data);
  }

  /*
   * find a new instance of the model
   *
   * @param number id
   *
   * @return instance
   *
   * */
  public static async find (id : number) : Promise<any>{

    return Model.findRow(id, this);
    // return await db.Instance.find (id, this);
  }

  /*
   * fetch the collection of models
   *
   *
   * @return Collection
   *
   * */
  public static async fetchAll () : Promise<any>{

    return Model.fetchAllrows(this);
    //return db.Instance.fetchAll (this);
  }

  /*
   * start a queryBuilder instance with select
   *
   * @param array args
   *
   * @return queryBuilderInstance
   *
   * */
  public static select(...args){
  
    let qryBuilder = new queryBuilder();
    qryBuilder.setModel(this);
    return qryBuilder.select(args);
  }

  /*
   * 
   * start a queryBuilder instance with where
   *
   * @param String field
   * @param String comparer
   * @param any value
   *
   * @return queryBuilderInstance
   *
   * */
  public static where(field : string, comparer : string, value : any){
  
    let qryBuilder = new queryBuilder();
    qryBuilder.setModel(this);
    return qryBuilder.where(field, comparer, value);
  }

}
