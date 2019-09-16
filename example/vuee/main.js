import Vue from 'vue'; // "module": "dist/vue.runtime.esm.js",
import app from './app'


const Welcome = {
    name: 'welcome',
    data() {
        return {
            name: 'kk'
        }
    },
    computed: {
        name2: function() {
            return this.name
        }
    },
    render(h) {
        return <h1>Hello <span>{this.name2}</span></h1>;
    }
}

new Vue({
    el: '#app',
    data: function(){ 
        return {
            age: 15,
            form: {}
         }
    },
  	methods: {
        clickHandler: function() {
            this.form.name = 'kkk'
        }
    },
    components: {
        Welcome: Welcome
    },
    render(h) {
      return (
        <div>
        	{/* <div name='d'  class='d1' style='color:red;' key='ddd' onClick={this.clickHandler}>click to change name</div>
            <div>name: {this.form.name || ''}</div>  
            <my-button></my-button> */}
            {/* <div>222</div> */}
            
            <Welcome></Welcome>
        </div>
      )
    }
})
