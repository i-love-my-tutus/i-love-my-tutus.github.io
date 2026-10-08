param([string]$InputPath, [string]$OutputBase)
Add-Type -AssemblyName System.Drawing
$source = [System.Drawing.Image]::FromFile($InputPath)
try {
 if ($source.PropertyIdList -contains 274) {
  $orientation = [BitConverter]::ToUInt16($source.GetPropertyItem(274).Value,0)
  $rotations = @{2=4;3=2;4=6;5=5;6=1;7=7;8=3}
  if ($rotations.ContainsKey([int]$orientation)) { $source.RotateFlip([System.Drawing.RotateFlipType]$rotations[[int]$orientation]) }
 }
 $originalWidth=$source.Width; $originalHeight=$source.Height
 $codec=[System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'
 foreach($size in @(480,960,1600)) {
  $width=[Math]::Min($size,$source.Width); $height=[int][Math]::Round($source.Height*$width/$source.Width)
  $bitmap=New-Object System.Drawing.Bitmap($width,$height)
  $graphics=[System.Drawing.Graphics]::FromImage($bitmap)
  try {
   $graphics.Clear([System.Drawing.Color]::FromArgb(16,9,31))
   $graphics.InterpolationMode=[System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
   $graphics.DrawImage($source,0,0,$width,$height)
   $parameters=New-Object System.Drawing.Imaging.EncoderParameters(1)
   $parameters.Param[0]=New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality,[long]88)
   $bitmap.Save("$OutputBase-$size.jpg",$codec,$parameters)
   $parameters.Dispose()
  } finally { $graphics.Dispose(); $bitmap.Dispose() }
 }
 @{width=$originalWidth;height=$originalHeight} | ConvertTo-Json -Compress
} finally { $source.Dispose() }
