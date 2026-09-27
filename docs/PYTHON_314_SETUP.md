# Python 3.14 setup

The backend deliberately keeps its default dependency set small and avoids a native ML stack in the runnable prototype. This reduces installation friction on Python 3.14.

```text
fastapi==0.115.6
uvicorn==0.34.0
pydantic>=2.12,<3
pandas>=2.2,<3
numpy>=2.0,<3
python-multipart>=0.0.20,<1
```

For production ML experiments, add a separate optional environment and validate package compatibility before changing the main hackathon environment.
