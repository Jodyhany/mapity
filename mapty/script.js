'use strict';


const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
let inputDistance = document.querySelector('.form__input--distance');
let inputDuration = document.querySelector('.form__input--duration');
let inputCadence = document.querySelector('.form__input--cadence');
let inputElevation = document.querySelector('.form__input--elevation');
class App{
    #map;
    #mapZomelevel = 15;
    #mapEvent;
  #workouts = [];
    constructor(){
        this._getPoition();
        this._getlocalStorge()
form.addEventListener('submit',this._newWorkout.bind(this))
inputType.addEventListener('change',this._toggleEvlationField.bind(this))
containerWorkouts.addEventListener('click',this._moveTOPup.bind(this))
}

    _getPoition(){
if(navigator.geolocation)
    navigator.geolocation.getCurrentPosition(this._loadMap.bind(this),  function (){
        console.log('i dont see u')
    })
    }
    _loadMap(p){
            const {latitude}=p.coords
            const {longitude}=p.coords
            const coords = [latitude,longitude]
            //   lefalt libary
                this.#map = L.map('map').setView(coords,  this.#mapZomelevel );
            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(this.#map);
            // event to show form when click on map
            this.#map.on('click',this._showForm.bind(this))
          this.#workouts.forEach(work=> { this.renderWorkoutMarkert(work)})
            }
    _showForm(mape){
        this.#mapEvent=mape
        form.classList.remove('hidden')
        inputDistance.focus()
    }
    _hideForm(){
      inputCadence.value  = inputDistance.value = inputElevation.value = inputDuration.value= ' '
      form.style.disply='none'
      form.classList.add('hidden')
      setTimeout(()=>form.style.disply='gird',1000)
    }
    _toggleEvlationField(){
        inputElevation.closest('.form__row').classList.toggle('form__row--hidden')
        inputCadence.closest('.form__row').classList.toggle('form__row--hidden')
    }
    _newWorkout(e){
        e.preventDefault()
        const valdinputs=(...inputs)=>inputs.every(inp=> Number.isFinite(inp))
        const allPostive = (...inputs)=>inputs.every(inp=> inp>0)
        // get data
        const type=inputType.value
        const distance = +inputDistance.value
        const duration = +inputDuration.value
        const {lat,lng}=this.#mapEvent.latlng
        let workout;
        //  if data running
        if(type ==='running'){
            const cadence =+inputCadence.value
            //  check data
            if(
                !valdinputs(distance,duration,cadence)   ||
                !allPostive(distance,duration,cadence)
            )
                { return alert ('inputs must be vaild number')}
       workout = new running ([lat,lng],distance,duration,cadence)
           this.#workouts.push(workout)
        } 
        //  if data cycling 
        if(type ==='cycling'){
            const elevation =+inputElevation.value
              //  check data
              if(
                !valdinputs(distance,duration,elevation)  ||
                !allPostive(distance,duration)
            ) 
                {return alert ('inputs must be vaild number')}
                workout = new cycling ([lat,lng],distance,duration,elevation)
        } 
        // add new object to workout array
        this.#workouts.push(workout)
        // render workout on map as marker 
        this.renderWorkoutMarkert(workout)
        // render workout 
        this._renderWorlout(workout)
        //  reset form data + hide form 
        this._hideForm()
        //  set localstorge to all workouts
        this._setLocalStorge()
    }
    renderWorkoutMarkert(workout){
          // map popup
            L.marker(workout.coords).addTo(this.#map)
            .bindPopup(L.popup({
                maxWidth:250,
                minWidth:100,
                autoClose:false,
                closeOnClick:false,
                className:`${workout.type}-popup`
            }))
            // set content for map popup
            .setPopupContent(`${workout.type === 'running' ? '🏃‍♂️' : '🚴'}${workout.description}`)
            .openPopup();
    }
    _renderWorlout(workout){
        let html=` <li class="workout workout--${workout.type}" data-id="${workout.id}">
          <h2 class="workout__title">${workout.description}</h2>
          <div class="workout__details">
            <span class="workout__icon">${workout.type === 'running' ? '🏃‍♂️' : '🚴'}</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
            <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>`
          if(workout.type ==='running')
              html +=`<div class="workout__details">
                  <span class="workout__icon">⚡️</span>
                  <span class="workout__value">${workout.pace.toFixed(1)}</span>
                  <span class="workout__unit">min/km</span>
                </div>
                <div class="workout__details">
                  <span class="workout__icon">🦶🏼</span>
                  <span class="workout__value">${workout.Cadence}</span>
                  <span class="workout__unit">spm</span>
                </div>
              </li>`
          
          if(workout.type==='cycling')
            html+=`
                    <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.evlationgain}</span>
            <span class="workout__unit">m</span>
          </div>
        </li> `
          form.insertAdjacentHTML('afterend',html)
          
    }
    _moveTOPup(e){
        const workOutel=e.target.closest('.workout')
        if(!workOutel) return
        const workout  = this.#workouts.find(work=>work.id===workOutel.dataset.id)
        this.#map.setView(workout.coords,this.#mapZomelevel,{
            animate:true,
            pan:{
                duration:1
            }
        })
    }
    _setLocalStorge(){
        localStorage.setItem('workouts',JSON.stringify(this.#workouts))
    }
    _getlocalStorge(){
      const data= JSON.parse( localStorage.getItem('workouts'))
      if(!data) return
      this.#workouts=data
      this.#workouts.forEach(work=>{this._renderWorlout(work)
      })
    }
    rest(){
      localStorage.removeItem('workouts')
      location.reload()
    }
}
class workOut{
    date=new Date();
    id=( Date.now()+''.slice(-10));
    clciks=0
    constructor(coords,distance,duration){
        this.coords=coords
         this.distance=distance 
        this.duration=duration
    }
    clcik(){
        this.clciks++
    }
    _setDescription(){
        // prettier-ignore
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`
    }
}
class running extends workOut {
        type='running'
    constructor(coords,distance,duration,Cadence){
        super(coords,distance,duration)
        this.Cadence=Cadence
        this.calcPace()
        this._setDescription()
    }
    calcPace(){
        this.pace = this.duration / this.distance
        return this.pace
    }
}
class cycling extends workOut {
    type='cycling'
    constructor(coords,distance,duration,evlationgain){
        super(coords,distance,duration)
        this.evlationgain=evlationgain
        this.calcSpeed()
        this._setDescription()
    }
    calcSpeed(){
        this.speed = this.distance  /( this.duration / 60)
        return this.speed
    }
}

const  app = new App();


