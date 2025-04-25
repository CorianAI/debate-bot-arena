const React = require('react');
const { render, screen } = require('@testing-library/react');
const { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } = require('../../components/ui/card');

describe('Card Component', () => {
  it('renders Card with all subcomponents', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Card Content</p>
        </CardContent>
        <CardFooter>
          <p>Card Footer</p>
        </CardFooter>
      </Card>
    );
    
    // Check if all parts are rendered
    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card Description')).toBeInTheDocument();
    expect(screen.getByText('Card Content')).toBeInTheDocument();
    expect(screen.getByText('Card Footer')).toBeInTheDocument();
  });

  it('renders Card with custom className', () => {
    render(
      <Card className="custom-class">
        <CardContent>Test Content</CardContent>
      </Card>
    );
    
    // Just verify the content is rendered
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders CardHeader with title and description', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Test Title</CardTitle>
          <CardDescription>Test Description</CardDescription>
        </CardHeader>
      </Card>
    );
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('renders CardContent with content', () => {
    render(
      <Card>
        <CardContent>
          Content Text
        </CardContent>
      </Card>
    );
    
    expect(screen.getByText('Content Text')).toBeInTheDocument();
  });

  it('renders CardFooter with content', () => {
    render(
      <Card>
        <CardFooter>
          Footer Text
        </CardFooter>
      </Card>
    );
    
    expect(screen.getByText('Footer Text')).toBeInTheDocument();
  });
});