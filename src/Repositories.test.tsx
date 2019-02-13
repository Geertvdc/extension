import * as React from 'react';
import * as ReactDOM from 'react-dom';
import RepositoriesReport from './Repositories';

describe('Repositories', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render((<RepositoriesReport />), div);
    ReactDOM.unmountComponentAtNode(div);
  });
});