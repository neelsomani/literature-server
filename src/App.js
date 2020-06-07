import React, { Component } from 'react';
import Game from './views/Game';
import CreateRoom from './views/CreateRoom';
import { BrowserRouter, Route } from 'react-router-dom';

class App extends Component {
    render() {
        return (
            <BrowserRouter>
                <div style={{ fontFamily: 'Circular, BlinkMacSystemFont, Roboto, Helvetica Neue, sans-serif' }}>
                    <Route exact={true} path='/' render={() => (
                        <div className='App'>
                            <CreateRoom />
                        </div>
                    )} />
                    <Route exact={false} path='/game' render={() => (
                        <div className='App'>
                            <Game />
                        </div>
                    )} />
                </div>
            </BrowserRouter>
        );
    }
}
export default App;
