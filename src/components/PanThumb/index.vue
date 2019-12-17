<template>
  <div :style="{zIndex:zIndex,height:height,width:width}" class="pan-item">
    <div class="pan-info">
      <div class="pan-info-roles-container">
        <slot />
      </div>
    </div>
    <img v-if="image !== ''" :src="image" class="pan-thumb">
  </div>
</template>

<script>
export default {
  name: 'PanThumb',
  props: {
    image: {
      type: String,
      required: true
    },
    zIndex: {
      type: Number,
      default: 1
    },
    width: {
      type: String,
      default: '80px'
    },
    height: {
      type: String,
      default: '80px'
    }
  }
}
</script>

<style scoped>
.pan-item {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  display: inline-block;
  position: relative;
  cursor: default;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.pan-info-roles-container {
  padding: 20px;
  text-align: center;
}

.pan-thumb {
  width: 100%;
  height: 100%;
  background-size: 100%;
  border-radius: 50%;
  overflow: hidden;
  position: absolute;
}

.pan-info {
  position: absolute;
  width: inherit;
  height: inherit;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: inset 0 0 0 3px rgba(0, 0, 0, 0.05);
}

.pan-info h3 {
  color: #fff;
  text-transform: uppercase;
  position: relative;
  letter-spacing: 2px;
  font-size: 18px;
  margin: 0 60px;
  padding: 22px 0 0 0;
  height: 85px;
  font-family: 'Open Sans', Arial, sans-serif;
  text-shadow: 0 0 1px #fff, 0 1px 2px rgba(0, 0, 0, 0.3);
}

.pan-info p {
  color: #fff;
  padding: 10px 5px;
  font-style: italic;
  margin: 0 30px;
  font-size: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.5);
}

.pan-info p a {
  display: block;
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  color: #fff;
  font-style: normal;
  font-weight: 700;
  text-transform: uppercase;
  font-size: 9px;
  letter-spacing: 1px;
  padding-top: 24px;
  margin: 7px auto 0;
  font-family: 'Open Sans', Arial, sans-serif;
  opacity: 0;
}

.pan-item:hover .pan-info p a {
  opacity: 1;
}
</style>
