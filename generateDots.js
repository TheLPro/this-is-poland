const dampingx = 0.98;
const dampingy = 0.98;
const harddamping = 0.9;
const repulsionFactor = 0.5;
const cursor_vX = 0;
const cursor_vY = 0;
var button;
var m;
var dots;

class Modal {
  constructor(imageUrl, text, desc) {
    this.imageUrl = imageUrl;
    this.text = text;
    this.desc = desc;
    this.modalElement = null;
    this.imageElement = null;
    this.textElement = null;
    this.descElement = null;
  }

  createModal() {
    this.modalElement = document.createElement('div');
    this.modalElement.classList.add('modal');

    this.imageElement = document.createElement('img');
    this.imageElement.src = this.imageUrl;
    this.imageElement.alt = 'Modal Image';
    this.imageElement.setAttribute('loading', 'lazy');
    this.modalElement.appendChild(this.imageElement);

    this.textElement = document.createElement('span');
    this.textElement.textContent = this.text;
    this.modalElement.appendChild(this.textElement);

    this.descElement = document.createElement('p');
    this.descElement.textContent = this.desc;
    this.modalElement.appendChild(this.descElement);

    this.button = document.createElement('button');
    this.button.textContent = 'Close';
    this.button.addEventListener('click', () => {
      this.hideModal();
    });
    this.modalElement.appendChild(this.button);

    document.body.appendChild(this.modalElement);
  }

  set(imageUrl, text, desc) {
    this.imageUrl = imageUrl;
    this.text = text;
    this.desc = desc;

    if (this.imageElement) {
      this.imageElement.src = this.imageUrl;
    }

    if (this.textElement) {
      this.textElement.textContent = this.text;
    }

    if (this.descElement) {
      this.descElement.textContent = this.desc;
    }
  }

  showModal() {
    if (!this.modalElement) {
      this.createModal();
    }
    this.modalElement.style.display = 'block';
  }

  hideModal() {
    if (this.modalElement) {
      this.modalElement.style.display = 'none';
    }
  }
}
// Define the getData function
async function getData() {
  const response = await fetch('csv.tsv');
  const data = await response.text();
  return data;
}

// Define the transformData function
async function transformData() {
  let data = await getData();
  let array = data.split('\n');
  let arrayOfObjects = array.map((item) => {
    const [title, description, pic] = item.split('\t'); // Split by semicolon
    return {
      title,
      description,
      pic
    };
  });
  return arrayOfObjects;
}

const container = document.getElementById('dot_container'); // Move this line outside the event listener

window.addEventListener('load', async () => {
  // Call transformData to get the data
  const dot_data = await transformData();

  m = new Modal('https://picsum.photos/200', 'Test', 'Test');
  dot_data.forEach((dot_info) => {
    const dot = new Dot(
      container, // Pass the container as an argument
      dot_info.title,
      dot_info.description,
      dot_info.pic
    );
    if (!dots) dots = [];
    dots.push(dot);
  });
  setTimeout(() => {}, 2000);
  document.getElementById('dot_loading').style.display = 'none';

  function animate() {
    for (const dot of dots) {
      dot.update();
      dot.render();
    }

    requestAnimationFrame(animate);
  }

  animate();
});

class Dot {
  constructor(container, title, description, pic) {
    this.container = container; // Store the container in the Dot object
    this.element = document.createElement('div');
    this.element.className = 'dot';

    // Check if pic is a valid URL before setting it as background
    if (pic && typeof pic === 'string') {
      this.element.style.backgroundImage = `url(${pic})`;
    } else {
      console.error('Invalid pic:', pic);
    }
    
    this.element.setAttribute('title', title);
    this.element.setAttribute('description', description);

    this.span = document.createElement('span');
    this.span.classList.add('dot-title');
    this.span.innerHTML = title;
    this.element.appendChild(this.span);

    container.appendChild(this.element);

    this.position = {
      x: Math.random() * container.clientWidth, // Adjust the multiplication factor
      y: container.clientHeight * Math.random() // Adjust the multiplication factor
    };

    this.velocity = {
      x: 0,
      y: 0
    };

    this.acceleration = {
      x: 0,
      y: 0
    };

    this.hovered = false;
    this.justhovered = false;
    this.clicked = false;

    this.rotation = Math.random() * 360 - 180;

    this.element.addEventListener('mouseover', () => {
      this.hovered = true;
      this.justhovered = true;
    });

    this.element.addEventListener('mouseout', () => {
      this.hovered = false;
      this.justhovered = true;
    });

    this.element.addEventListener('click', (event) => {
      if (!this.clicked) {
        event.stopPropagation();
        m.set(
          pic,
          this.element.getAttribute('title'),
          this.element.getAttribute('description')
        );
        m.showModal();
        this.clicked = true;
      } else {
        m.hideModal();
        this.clicked = false;
      }
    });
  }

  checkCollision(otherDot) {
    const dx = otherDot.position.x - this.position.x;
    const dy = otherDot.position.y - this.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const minDistance =
      this.element.clientWidth / 2 + otherDot.element.clientWidth / 2;

    if (distance < minDistance) {
      const angle = Math.atan2(dy, dx);
      const overlap = minDistance - distance;

      // Move the dots apart to avoid collision
      this.position.x -= overlap * Math.cos(angle) * 1;
      this.position.y -= overlap * Math.sin(angle) * 1;
    }
  }

  render() {
    this.element.style.left =
      this.position.x - this.element.clientWidth / 2 + 'px';
    this.element.style.bottom =
      this.position.y - this.element.clientHeight / 2 + 'px';
  }

  update() {
    // this.velocity.x =
    //   (this.velocity.x + this.acceleration.x + cursor_vX * 0.01) * dampingx;
    // this.velocity.y =
    //   (this.acceleration.y + this.velocity.y + cursor_vY * 0.01) * dampingy;

    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    if (this.hovered) {
      this.velocity = {
        x: this.velocity.x * harddamping,
        y: this.velocity.y * harddamping
      };
    } else {
      this.rotation =
        ((this.rotation + (this.velocity.x + this.velocity.y) + 180) % 360) -
        180;
    }

    if (this.position.x < this.element.clientWidth / 2) {
      this.velocity.x *= -1 * repulsionFactor;
      this.position.x = this.element.clientWidth / 2;
    } else if (
      this.position.x >
      this.container.clientWidth - this.element.clientWidth / 2
    ) {
      this.velocity.x *= -1 * repulsionFactor;
      this.position.x = container.clientWidth - this.element.clientWidth / 2;
    } else if (this.position.y < this.element.clientHeight / 2) {
      this.velocity.y *= -1 * repulsionFactor;
      this.position.y = this.element.clientHeight / 2;
    } else if (
      this.position.y >
      container.clientHeight - this.element.clientHeight / 2
    ) {
      this.velocity.y *= -1 * repulsionFactor;
      this.position.y = container.clientHeight - this.element.clientHeight / 2;
    } else if (this.hovered) {
      return;
    } else if (this.justhovered) {
      this.justhovered = false;
      this.velocity = { x: 0, y: 0 };
      return;
    }
    for (const dot of dots) {
      if (dot !== this) {
        this.checkCollision(dot);
      }
    }
  }
}

// Inactivity code

let inactivityTimeout;

// Function to redirect after a minute of inactivity
function redirectToHTMLFile() {
  window.location.href = './index.html'; // Replace 'yourpage.html' with the actual file you want to redirect to.
}

// Reset the inactivity timer whenever there's user interaction
function resetInactivityTimer() {
  clearTimeout(inactivityTimeout); // Clear the previous timeout (if any)
  inactivityTimeout = setTimeout(redirectToHTMLFile, 60000);
}

// Attach event listeners to reset the timer on user interaction
window.addEventListener('mousemove', resetInactivityTimer); // Mouse movement
window.addEventListener('keydown', resetInactivityTimer); // Key press
window.addEventListener('click', resetInactivityTimer); // Mouse click
