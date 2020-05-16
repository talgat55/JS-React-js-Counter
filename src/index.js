import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
// Slomux — упрощённая, сломанная реализация Flux.
// Перед вами небольшое приложение, написанное на React + Slomux.
// Это нерабочий секундомер с настройкой интервала обновления.

// Исправьте ошибки и потенциально проблемный код, почините приложение и прокомментируйте своё решение.

// При нажатии на "старт" должен запускаться секундомер и через заданный интервал времени увеличивать свое значение на значение интервала
// При нажатии на "стоп" секундомер должен останавливаться и сбрасывать свое значение

const createStore = (reducer, initialState = 1) => {
    let currentState = initialState;
    const listeners = [];

    const getState = () => currentState;
    const dispatch = action => {
        currentState = reducer(currentState, action);
        listeners.forEach(listener => listener())
    };

    const subscribe = listener => listeners.push(listener);

    return {getState, dispatch, subscribe}
};

const connect = (mapStateToProps, mapDispatchToProps) =>
    Component => {
        class WrappedComponent extends React.Component {
            render() {
                return (
                    <Component
                        {...this.props}
                        {...mapStateToProps(this.context.store.getState(), this.props)}
                        {...mapDispatchToProps(this.context.store.dispatch, this.props)}
                    />
                )
            }

            componentDidUpdate() {
                this.context.store.subscribe(this.handleChange)
            }

            handleChange = () => {
                this.forceUpdate()
            }
        }

        WrappedComponent.contextTypes = {
            store: PropTypes.object,
        };

        return WrappedComponent
    };

class Provider extends React.Component {
    getChildContext() {
        return {
            store: this.props.store,
        }
    }

    render() {
        return React.Children.only(this.props.children)
    }
}

Provider.childContextTypes = {
    store: PropTypes.object,
};

// actions
const CHANGE_INTERVAL = 'CHANGE_INTERVAL';

// action creators
const changeInterval = value => ({
    type: CHANGE_INTERVAL,
    payload: value,
});


// reducers
const reducer = (state, action) => {
    switch (action.type) {
        case CHANGE_INTERVAL:

            // if decrement and state 1
            if(state === 1  && action.payload === -1){
                return  state = 1;
            }

            return  state += action.payload;

        default:
            return {}
    }
};

// components

class IntervalComponent extends React.Component {
    state = {
        currentInterval: this.props.currentInterval
    };

    changeInterval(value){
        this.props.changeInterval(value);
        if(this.state.currentInterval === 1 && value === -1 ){

        }else{
            this.setState( (prevState) =>{
                return {
                    currentInterval: prevState.currentInterval +value
                }
            });
        }
    };


    render() {
        return (
            <div>
                <span>Интервал обновления секундомера: {this.state.currentInterval} сек.</span>
                <span>
                      <button onClick={ () => this.changeInterval(-1)} >-</button>
                      <button onClick={() => this.changeInterval(1)}>+</button>
                </span>
            </div>
        )
    }
};

const Interval = connect(
    state => ({
        currentInterval: state,
    }),
    dispatch => ({
        changeInterval: value => dispatch(
            changeInterval(value)
        ),
    })
)(IntervalComponent);

class TimerComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentTime: 0,
            interval: null
        };

        this.handleStart = this.handleStart.bind(this);
        this.handleStop = this.handleStop.bind(this);
    }

    // start counter
    handleStart() {
        this.state.interval = setInterval(() => this.setState({
            currentTime: this.state.currentTime + this.props.currentInterval,
        }), this.props.currentInterval);

    }
    // stop  counter
    handleStop() {
        this.setState({currentTime: 0});
        clearInterval(this.state.interval);
    }

    render() {
        return (
            <div>
                <Interval/>
                <div>
                    Секундомер: {this.state.currentTime} сек.
                </div>
                <div>
                    <button onClick={this.handleStart}>Старт</button>
                    <button onClick={this.handleStop}>Стоп</button>
                </div>
            </div>
        )
    }


}

const Timer = connect(state => ({
    currentInterval: state,
}), () => {
})(TimerComponent);

// init
ReactDOM.render(
    <Provider store={createStore(reducer)}>
        <Timer/>
    </Provider>,
    document.getElementById('root')
);

