import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";

const food = [
  {
    name: "Plov",
    description: "Rice dish with meat, carrots, onions—the most famous meal in Uzbekistan.",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Urazmat-Plov.jpg/2560px-Urazmat-Plov.jpg",
    recipeLink: "https://zira.uz/ru/recipe/tashkentskiy-plov/"
  },
  {
    name: "Samsa",
    description: "Savory pastry with meat or vegetables, baked in a clay oven.",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Ouzbékistan-Samsas.jpg/500px-Ouzbékistan-Samsas.jpg",
    recipeLink: "https://zira.uz/ru/recipe/videorecept-samsa-kak-ranshe/"
  },
  {
    name: "Lagman",
    description: "Noodle soup with vegetables and meat, influenced by Central Asian and Chinese cuisines.",
    img: "https://upload.wikimedia.org/wikipedia/commons/7/74/Лагман.jpg",
    recipeLink: "https://zira.uz/ru/recipe/uygurskiy-lagman/"
  },
  {
    name: "Shashlik",
    description: "Grilled skewered meat, often served with onions and bread.",
    img: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Shashlik.jpg/960px-Shashlik.jpg",
    recipeLink: "https://zira.uz/ru/recipe/videorecept-shashlyik-iz-govyadinyi-v-duhovke/"
  }
];

function FoodTab() {
  return (
    <Container className="py-4">
      <h2 className="mb-4 text-center">Uzbek Food</h2>
      <Row xs={1} md={2} lg={2} className="g-4">
        {food.map((item, idx) => (
          <Col key={idx}>
            <Card className="h-100 shadow-sm">
              <Card.Img 
                variant="top" 
                src={item.img} 
                alt={item.name}
                style={{ height: "250px", objectFit: "cover" }}
              />
              <Card.Body className="d-flex flex-column">
                <Card.Title className="fw-bold">{item.name}</Card.Title>
                <Card.Text className="text-muted flex-grow-1">
                  {item.description}
                </Card.Text>
                <Button 
                  variant="primary" 
                  href={item.recipeLink} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2"
                >
                  View Recipe →
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default FoodTab;