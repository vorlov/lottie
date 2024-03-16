import './App.css';
import { ApolloProvider } from '@apollo/client';
import client from './api';
import FeaturedAnimations from './FeaturedAnimations';
import Editor from './Editor';
import Chat from './Chat';
import { Col, Row } from 'antd';

function App() {
  return (
    <ApolloProvider client={client}>
      <div className="App">
        <h1>Real-Time Collaboration with LottieFiles</h1>
        
        <Row gutter={[16, 16]}>
          <Col span={ 24 }>
          <FeaturedAnimations />
          </Col>
          <Col span={ 12 }>
            <Editor />
          </Col>
          <Col span={ 12 }>
            <Chat />
          </Col>
        </Row>
      </div>
    </ApolloProvider>
  );
}

export default App;
