export default async function handler(req, res) {
  // Solo POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  // Validación básica
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Email inválido' });
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        email: email,
        listIds: [9],
        updateEnabled: true, // si ya existe, lo actualiza sin error
        attributes: {
          SOURCE: 'landing_carey_sea',
        }
      }),
    });

    // 201 = creado, 204 = actualizado — ambos son éxito
    if (response.status === 201 || response.status === 204) {
      return res.status(200).json({ success: true });
    }

    const data = await response.json();

    // Brevo devuelve 400 si el contacto ya existe con ese email
    if (response.status === 400 && data.code === 'duplicate_parameter') {
      return res.status(200).json({ success: true }); // lo tratamos como éxito
    }

    console.error('Brevo error:', data);
    return res.status(500).json({ error: 'Error al registrar' });

  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Error del servidor' });
  }
}
