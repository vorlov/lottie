import { gql, useQuery } from "@apollo/client";
import { Player } from "@lottiefiles/react-lottie-player";
import { Card, Col, message, Row } from "antd";
import { FC } from "react";
import { selectedAnimationVar } from "./vars";

type QueryResult = {
  featuredPublicAnimations: {
    edges: {
      cursor: string;
      node: {
        id: string;
        name: string;
        description: string;
        jsonUrl: string;
      };
    }[];
  };
};

const GET_FEATURED_ANIMATIONS = gql`
  {
    featuredPublicAnimations(
      first: 2
    ) {
      edges {
        cursor
        node {
          id
          name
          description
          jsonUrl
        }
      }
    }
  }
`;

const downloadAndSendLottie = (lottieUrl: string) => async () => {
  try {
    const backendUrl = 'http://localhost:4000/download-lottie'; // Adjust this URL to your backend endpoint
    const result = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        url: lottieUrl,      
      }),
    });

    selectedAnimationVar(await result.json())

    message.success('Lottie JSON uploaded successfully!');
  } catch (error) {
    message.error('Failed to upload Lottie JSON.');
  }
};

const FeaturedAnimations: FC = () => {
  const { loading, error, data } = useQuery<QueryResult>(GET_FEATURED_ANIMATIONS);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error</p>;

  return (
    <Card>
    <Row gutter={[16, 16]}>
      
      {data?.featuredPublicAnimations.edges.map(({ node }) => (
        <Col flex={ 0 } key={node.id} onClick={ downloadAndSendLottie(node.jsonUrl) }>
          <h3>{node.name}</h3>
          <Player
            src={node.jsonUrl}
            background="transparent"
            speed={1}
            style={{ 
              width: 300, 
              height: 300,
              cursor: 'pointer'
            }}
            loop
            autoplay
          />
        </Col>
      ))}
    </Row>
    </Card>
  )
}

export default FeaturedAnimations;